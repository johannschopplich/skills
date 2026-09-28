# Smell Baseline

Fowler's code smells (_Refactoring_, ch. 3), adapted from Matt Pocock's `code-review`. They apply even when a repo documents nothing. A documented repo standard wins; where it endorses what a smell flags, drop the smell. Every smell is a `choice` ("possible Feature Envy"), never a hard violation.

- **Mysterious Name** – a name that doesn't reveal what it does or holds → rename; if no honest name comes, the design is murky.
- **Duplicated Code** – the same logic shape in more than one hunk or file → extract it, call it from both.
- **Feature Envy** – a method reaching into another object's data more than its own → move it onto that data.
- **Data Clumps** – the same few fields or params travelling together → bundle them into one type.
- **Primitive Obsession** – a primitive or string standing in for a domain concept → give the concept its own small type.
- **Repeated Switches** – the same `switch` or `if` cascade on the same type in several places → one map both sites share, or polymorphism.
- **Shotgun Surgery** – one logical change forcing scattered edits across many files → gather what changes together into one module.
- **Divergent Change** – one module edited for several unrelated reasons → split it.
- **Speculative Generality** – abstraction, parameters, or hooks for needs the spec doesn't have → delete; inline until a real need shows.
- **Message Chains** – `a.b().c().d()` navigation the caller shouldn't depend on → hide the walk behind one method.
- **Middle Man** – a class or function that mostly delegates → cut it, call the target directly.
- **Refused Bequest** – an implementer ignoring most of what it inherits → composition instead of inheritance.
