---
layout: page
title: Erga Deum
subtitle: Turn-Based Card Battler Combat System
permalink: /projects/erga-deum
tech: [Unity, C#]
status: In Development
---

Erga Deum is my current game development project, a turn-based 5v5 card battler built in Unity. The core focus is on creating an intricate combat system with dynamic character interactions, deep stat mechanics, and strategic deck-building. I'll be documenting development progress through blog posts as I build out the game.

## Combat System

The battle system operates on a turn-based state machine architecture. Each round, characters act in order based on their speed stat, with ties favoring the player. The state machine uses a stack-based approach to manage game flow:

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

## Card System

Each character has a personal deck that drives their combat abilities. The deck management system handles a draw pile, hand, and graveyard with automatic reshuffling:

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

Cards support multiple targeting types (Self, SingleTarget, AllEnemies, AllAllies) and can contain multiple card logics for complex effects like dealing damage while applying stat buffs.

## Stat Modifiers

The modifier system supports both raw (additive) and percentage (multiplicative) bonuses with varying durations. Modifiers can be temporary (lasting one action), round-based, or eternal:

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

Stats are recalculated dynamically whenever modifiers change. Raw bonuses accumulate first, then percentage boosts are summed and applied multiplicatively.

## Damage Calculation

Damage uses a formula that factors in the attacker's attack stat, the defender's defense, class resistances, and damage reduction modifiers:

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

## Passive Skills

Characters gain passive abilities that trigger on specific battle events. The system uses an event-driven architecture where passives register to relevant events and respond accordingly:

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

Passive triggers include: battle start, round end, when hit, on death, and when attacking. Characters in position 4 (the fifth slot) also gain access to special "Quattuor" skills.

## Character Classes

The game features 18 character classes that determine elemental strengths and weaknesses: Human, Beast, Earth, Water, Fire, Air, Electric, Space, Reality, Mind, Tough, AntiReality, Quantum, Cyber, Ghost, Fanatic, Arcane, and Necromancy. Each character has resistance values against all classes that factor into damage calculations.

## Positional Bonuses

Character position matters strategically. Different slots provide unique bonuses:
- **Slot 1**: +10% Max HP, +5% DEF
- **Slot 2**: +8% ATK
- **Slot 3**: +4% ATK, +4% DEF
- **Slot 5**: +10 Dodge, enhanced healing effectiveness

## Event System

The architecture is event-driven, keeping systems decoupled and extensible:

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

## Current Progress

The core battle system is functional with 5 implemented characters (Joseph, The Farmer, Nomad, Mutant Frog, Vulcan). Current focus areas include implementing enemy AI, expanding card effects, and building out the UI. Future plans include an interactive overworld map for character movement between battles.

## Screenshots

*Screenshots coming soon*

