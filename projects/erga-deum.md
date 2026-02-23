---
layout: page
title: Erga Deum
subtitle: Turn-Based Card Battler Combat System
permalink: /projects/erga-deum
tech: [Unity, C#]
status: In Development
---

Erga Deum is my current game development project, a turn-based 5v5 card battler built in Unity. The core focus is on creating an intricate combat system with dynamic character interactions, deep stat mechanics, and strategic deck-building.

## Architecture Overview

The system is built around three pillars: an **event-driven state machine** for battle flow, a **ScriptableObject data pipeline** for hot-swappable content authoring, and a **modifier stack** for real-time stat computation. All game data (characters, cards, passives) is defined as ScriptableObject assets, meaning designers can create and tweak content directly in the Unity editor without touching code or requiring recompilation. JSON serialization is layered on top for save/load and dynamic content injection at runtime.

## Combat System

The battle system operates on a turn-based state machine architecture. Each round, characters are sorted by speed and pushed onto a state stack. The state machine pops states one at a time — each state represents either a player turn, an enemy turn, or an end-of-round phase. This stack-based approach cleanly handles interrupts (e.g., a passive triggering a bonus action mid-round) by pushing new states onto the stack without disrupting the existing queue.

```csharp
private void ProcessState(BattleState state)
{
    if (state.type == BattleState.stateType.PlayerState)
    {
        playerTurn = true;
        currentCharacter = state.actor;
        currentCharacter.battleDeck.DrawNCards(2);
        cardHandManager.LoadCharacterDeck(currentCharacter.battleDeck);
    }
    else if (state.type == BattleState.stateType.EnemyState)
    {
        // Enemy AI processing
        UpdateBattleUI();
        currentTurnEnded = true;
    }
    else if (state.type == BattleState.stateType.EndRound)
    {
        ManageRound();
        EndRound();
        currentTurnEnded = true;
    }
}
```

The state machine transitions are deterministic — given the same initial conditions, the same sequence of actions will always produce the same result, which is critical for replays and debugging.

## Card System

Each character has a personal deck that drives their combat abilities. The deck management system handles a draw pile, hand, and graveyard with automatic reshuffling. Cards are ScriptableObject assets composed of one or more `CardLogic` components, making it trivial to create complex multi-effect cards (e.g., deal damage + apply a buff + draw a card) without writing new code.

```csharp
public void DrawNCards(int n)
{
    for (int i = 0; i < n; i++)
    {
        if (drawPile.Count == 0)
        {
            if (graveyard.Count > 0)
            {
                drawPile.AddRange(graveyard);
                graveyard.Clear();
                Shuffle(drawPile);
                var card = drawPile[0];
                drawPile.RemoveAt(0);
                hand.Add(card);
            }
            else
            {
                Debug.Log("no cards can be drawn. deck and graveyard are empty.");
                return;
            }
        }
        else
        {
            var card = drawPile[0];
            drawPile.RemoveAt(0);
            hand.Add(card);
        }
    }
}
```

Cards support multiple targeting types (`Self`, `SingleTarget`, `AllEnemies`, `AllAllies`) resolved at play time. The targeting system is fully decoupled from card logic via a coroutine-based async selection flow — when a card requires a single target, the battle manager yields to a `TargetingManager` that suspends execution until the player clicks a valid target, then resumes card resolution with the selected character:

```csharp
public void PlayCard(CardView cardView)
{
    var card = cardView.cardData;
    switch (card.GetTargetingType())
    {
        case TargetingType.Self:
            card.ExecCardLogics(currentCharacter);
            break;
        case TargetingType.SingleTarget:
            StartCoroutine(WaitForSingleTargetAndExecute(card, cardView));
            break;
        case TargetingType.AllEnemies:
            card.ExecCardLogics(currentCharacter, null, enemyCharacters);
            break;
        case TargetingType.AllAllies:
            card.ExecCardLogics(currentCharacter, null, playerCharacters);
            break;
    }
}

private IEnumerator WaitForSingleTargetAndExecute(BattleCard card, CardView view)
{
    BattleCharacter selected = null;
    yield return TargetingManager.Instance.SelectTargetAsync(result => selected = result);
    if (selected != null)
        card.ExecCardLogics(currentCharacter, selected);
}
```

A card doesn't know how it will be targeted until the player or AI selects targets, allowing the same card definition to behave differently based on context.

## Stat Modifiers

The modifier system supports both raw (additive) and percentage (multiplicative) bonuses with varying durations. Modifiers self-manage their lifecycle by subscribing to battle events — a temporary modifier hooks into `OnCharacterMoveEnded` and removes itself after one action, while a round-based modifier counts down via `OnRoundEnd`. This eliminates the need for a central modifier manager that would have to track every active buff/debuff.

```csharp
public class StatModifier
{
    public Stat affectedStat;
    public ModType modType;
    public Duration duration;
    public float modAmount;
    public int roundsLeft;
    public BattleCharacter character;

    public StatModifier(Stat s, ModType mt, Duration d, float amt, int rounds)
    {
        affectedStat = s;
        modType = mt;
        duration = d;
        modAmount = amt;
        roundsLeft = rounds;

        switch (duration)
        {
            case Duration.Temp:
                BattleEvents.OnCharacterMoveEnded += HandleCharacterMoveEnded;
                break;
            case Duration.Rounds:
                BattleEvents.OnRoundEnd += HandleRoundEnd;
                break;
        }
    }
}
```

Stats are recalculated on demand whenever the modifier list changes. The computation order is strict: base stat → sum all raw modifiers → sum all percentage modifiers → apply multiplicatively. This guarantees consistent behavior regardless of the order modifiers were applied:

```csharp
public void RecalculateStats()
{
    Dictionary<Stat, float> rawBonuses = new();
    Dictionary<Stat, float> percentBonuses = new();

    foreach (StatModifier s in statModifiers)
    {
        if (s.modType == ModType.Raw)
            rawBonuses[s.affectedStat] = rawBonuses.GetValueOrDefault(s.affectedStat) + s.modAmount;
        else if (s.modType == ModType.Percent)
            percentBonuses[s.affectedStat] = percentBonuses.GetValueOrDefault(s.affectedStat) + s.modAmount;
    }

    atk = (int)((correspChar.basicStats.atk + rawBonuses.GetValueOrDefault(Stat.ATK))
                * (1 + percentBonuses.GetValueOrDefault(Stat.ATK)));
    def = (int)((correspChar.basicStats.def + rawBonuses.GetValueOrDefault(Stat.DEF))
                * (1 + percentBonuses.GetValueOrDefault(Stat.DEF)));
    // ... similar for all stats
}
```

## Damage Calculation

Damage uses a nonlinear formula based on the natural exponential to create diminishing returns at high attack values and meaningful scaling at low-to-mid ranges. The formula factors in the attacker's attack stat, the defender's defense, per-class resistance values, and any active damage reduction modifiers:

```csharp
public int CalculateDamage(int oppAtk, CharacterClass oppClass)
{
    float numerator = (float)Math.Pow(oppAtk, Math.E - 1) * (float)Math.Log(oppAtk);
    float denominator = def * (float)Math.E;
    float damage = numerator / denominator;

    // Apply class resistance
    float classRes = classResistances[oppClass];
    foreach (var c in classResModifiers)
        if (c.affectedClass == oppClass)
            classRes += c.modAmount;
    damage = damage * (1f - classRes);

    // Apply damage reduction multiplicatively
    foreach (StatModifier s in statModifiers)
    {
        if (s.affectedStat == Stat.DMGRED)
            damage = damage * (1f - s.modAmount);
    }
    damage = damage * (1f - dmgred);

    return (int)damage < 1 ? 0 : (int)damage;
}
```

Damage reduction modifiers stack multiplicatively rather than additively — two 50% reductions result in 75% total reduction, not 100%. This prevents stacking from trivializing combat.

## Passive Skills

Characters gain passive abilities that trigger on specific battle events. Passives are implemented as ScriptableObject subclasses that register callbacks on `BattleEvents`. This is the core extensibility mechanism — adding a new passive type means creating a new ScriptableObject class and overriding `Register()`, with zero changes to the battle engine itself.

```csharp
[CreateAssetMenu(menuName = "Characters/Passives/On Battle Start/Battle Start - Self Stat Mod")]
public class BattleStartSelfStatMod : PassiveSkill
{
    public Stat stat;
    public ModType modType;
    public Duration duration;
    public float amount;
    public int roundsActive;

    public override void Register(BattleCharacter owner)
    {
        base.Register(owner);
        BattleEvents.OnBattleStart += HandleBattleStart;
    }

    private void HandleBattleStart()
    {
        b.AddStatModifier(new StatModifier(stat, modType, duration, amount, roundsActive));
    }
}
```

Passive triggers include: battle start, round end, when hit, on death, and when attacking. Characters in position 4 (the fifth slot) also gain access to special "Quattuor" skills — powerful passives that are balanced by requiring you to sacrifice a team slot's positional bonus.

### Reactive & Conditional Passives

Beyond simple event-triggered passives, the system supports reactive passives that dynamically apply and remove modifiers based on runtime conditions. For example, `HPConditionedStatMod` watches for HP changes and toggles a stat modifier on/off depending on whether the character's health crosses a threshold:

```csharp
[CreateAssetMenu(menuName = "Characters/Passives/Persistent/HP-Conditioned/HP-Conditioned Continuous Stat Mod")]
public class HPConditionedStatMod : PassiveSkill
{
    public ThresholdCondition thresholdCondition;
    public float threshold;
    public Stat stat;
    public ModType modType;
    public float amount;

    private bool isActive = false;
    private StatModifier s;

    private void HandleCharacterHPChanged(BattleCharacter c)
    {
        if (c != b) return;
        float t = (thresholdType == ModType.Percent) ? threshold * b.correspChar.basicStats.maxHP : threshold;

        if (ThresholdEvaluator.Evaluate(b.GetHP(), thresholdCondition, t))
        {
            if (!isActive) { s = new StatModifier(stat, modType, Duration.Eter, amount, 0); b.AddStatModifier(s); }
        }
        else
        {
            if (isActive) b.RemoveStatModifier(s);
        }
    }
}
```

Similarly, `CharacterAttackingStaminaBasedStatMod` scales a modifier's strength by the character's current stamina at the moment of attacking, creating passives whose power fluctuates dynamically throughout a round. `OnAllyDeathSelfStatMod` buffs a character whenever an ally dies, and `BattleStartAllyCountStatMod` conditionally applies bonuses based on team size — enabling "last stand" or "full squad" character archetypes purely through data configuration.

## Event System

The architecture is event-driven, keeping systems decoupled and extensible. The battle engine fires events at key moments; any system (UI, audio, passives, modifiers) can subscribe without the engine knowing about them. This makes it possible to add entire new systems (e.g., a combat log, achievement tracking) without modifying core battle code.

```csharp
public static class BattleEvents
{
    public static event Action OnBattleStart;
    public static event Action OnRoundEnd;
    public static event Action<BattleCharacter> OnCharacterDead;
    public static event Action<BattleCharacter> OnCharacterAttacking;
    public static event Action<BattleCharacter> OnCharacterHit;
    public static event Action<BattleCharacter> OnCharacterMoveEnded;
    // ...
}
```

## Character Classes

The game features 18 character classes that determine elemental strengths and weaknesses: Human, Beast, Earth, Water, Fire, Air, Electric, Space, Reality, Mind, Tough, AntiReality, Quantum, Cyber, Ghost, Fanatic, Arcane, and Necromancy. Each character stores a resistance float against every class, creating a complex matchup matrix that rewards team composition planning.

## Positional Bonuses

Character position matters strategically. Different slots provide unique bonuses:
- **Slot 1**: +10% Max HP, +5% DEF
- **Slot 2**: +8% ATK
- **Slot 3**: +4% ATK, +4% DEF
- **Slot 5**: +10 Dodge, enhanced healing effectiveness

## Screenshots

*Screenshots coming soon*
