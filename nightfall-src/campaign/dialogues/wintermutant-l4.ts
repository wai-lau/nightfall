import parseDialogue from "../../util/parseDialogue";

export const WintermutantL4 = parseDialogue(`
wintermutant:l4:100-600

#100 It's me again, no way you forgot.
>200 What's up?
>200 Hey, Winter.

#200 That battle was W. Anyway, I was going through the nodes you've been in and found something kinda sus. Whoever hacked through Pharmhaus left something behind.
>300 Left what behind?

#300 Some weird program. I tried to pull it up but it literally just deleted itself before I could check it out.
>400 Where did it come from?
>401 What did it do?

#400 Not sure. Probably the same person behind all these corrupted nodes. There was a link to something called Nightfall. I'll keep digging through the logs.
>500 Appreciate it.
>500 Do that.

#401 No idea, just this link. Something called Nightfall. Could be connected to whoever's corrupting everything. I'll keep looking tho.
>600 Appreciate it.
>500 Do that.

#500 Always. Happy to help S.M.A.R.T. Catch you later.
>600 Later.
`);
