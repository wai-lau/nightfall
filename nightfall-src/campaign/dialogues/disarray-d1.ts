import parseDialogue from "../../util/parseDialogue";

export const DisarrayD1 = parseDialogue(`
disarray:f4:100-700

#100 Still up out there?
>200 Hey, Disarray. How about you?
>200 Still here.

#200 Of course I'm still online. Nothing this puny is going to take a hacker of my skills down. Anyway, I've been digging around and I found something. Do you have time to check it out?
>300 I don't know, what is it?
>300 Sure.

#300 SmA-RT's got a special program that would really help with the crashing and all. It comes in two halves, hidden in the corporate nodes around here. And it's encrypted - the decryption key's locked up in a TANG node.
>400 What's the program?
>401 How do I fit in?

#400 Network software, it's complicated. Anyway, the program is encrypted, so I'm going to need a lot of time to decipher it. Can you shut down security so I can get in there and concentrate on the real work?
>500 Let me think about it.
>500 Sure thing.

#401 Well, the program's encrypted, so I need to spend a lot of time just finding it. Can you hold down security so I can get in there and do the real work?
>500 Let me think about it.
>500 Sure thing.

#500 Three nodes, then: the two halves and the TANG key. They're locked down tight, so line up the right access codes before you go knocking.
>600 Got it.

#600 Loading all three onto your map now. Get me in and I'll handle the rest. I'll catch up when you've cleared the security. Later, newbie.
>700 Ready to receive node data.
`);