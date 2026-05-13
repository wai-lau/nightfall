import parseDialogue from "../../util/parseDialogue";

export const WintermutantL3 = parseDialogue(`
wintermutant:l3:100-600

#100 No cap, I've been lowkey watching your runs and bro you are GOATED. Sorry to interrupt tho. Can we talk real quick?
>200 Who are you?
>201 Sure.

#200 I'm kinda a hacker? Still learning but fr fr your moves are insane. You here for the Dr. Donut situation?
>300 What Dr. Donut situation?
>301 Where did you hear about that?

#201 I noticed SmA-RT was down but you're still out here grinding. Lowkey respect. You here about the Dr. Donut thing?
>300 What Dr. Donut situation?
>301 Where did you hear about that?

#300 I guess that's not on your radar rn. Some hacker cooked their systems and now everything's glitching out.
>400 Send me the node info.
>400 Where is it?

#301 SmA-RT crashed so I went full detective mode. Yeah, they got hit and their systems are completely cooked.
>400 Send me the node info.
>400 Where is it?

#400 On it, just give me a sec, I know I have it somewhere...
>500 I'm waiting.
>500 Take your time.

#500 Found it! Uploading the node to your netmap now. Was bussin talking to you. Laters.
>600 Ready to receive node data.
`);
