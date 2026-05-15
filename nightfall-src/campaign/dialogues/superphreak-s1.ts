import parseDialogue from "../../util/parseDialogue";

export const SuperphreakS1 = parseDialogue(`
superphreak:s1:100-600

#100 Hey, newbie. Bridge's secured. Nice work.
>200 What were they after?

#200 Sensitive code. One specific package. Can't name it here.
>300 They got it?

#300 They think we stole it.
>400 Did we?

#400 No. But whoever did made it look like us. This isn't the last of TANG. If we can't prove it wasn't us, they'll come back with more.
>500 How do we prove it?
>501 Think I can't handle it?

#500 Seeing this forged signature on the last TANG node you hit. Same fingerprint they were looking for.
>550 Same one?

#501 Definitely not. Took all of us to stop a recon run. TANG's a lot bigger than we are. Seeing this forged signature on the last TANG node you hit. Same fingerprint they were looking for.
>550 Same one?

#550 Same one. We need more samples to nail it down. Hit the next TANG node and bring evidence.
>600 Moving.
`);
