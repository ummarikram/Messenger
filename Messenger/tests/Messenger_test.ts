
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Ensure that sending & recieving works",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get('wallet_1')!;
        let block = chain.mineBlock([
            Tx.contractCall('Messenger', 'get-sent-messages', [types.ascii("ummar"), types.ascii("ahmed")], wallet_1.address),
            Tx.contractCall('Messenger', 'send-message', [types.ascii("ummar"), types.ascii("ahmed"), types.ascii("Hello Ahmed")], wallet_1.address),
            Tx.contractCall('Messenger', 'get-sent-messages', [types.ascii("ummar"), types.ascii("ahmed")], wallet_1.address),
            Tx.contractCall('Messenger', 'send-message', [types.ascii("ummar"), types.ascii("ahmed"), types.ascii("How are you?")], wallet_1.address),
            Tx.contractCall('Messenger', 'get-sent-messages', [types.ascii("ummar"), types.ascii("ahmed")], wallet_1.address),
            Tx.contractCall('Messenger', 'send-message', [types.ascii("ahmed"), types.ascii("ummar"), types.ascii("I am fine")], wallet_1.address),
            Tx.contractCall('Messenger', 'get-recieved-messages', [types.ascii("ummar"), types.ascii("ahmed")], wallet_1.address),
            Tx.contractCall('Messenger', 'get-recieved-messages', [types.ascii("ahmed"), types.ascii("ummar")], wallet_1.address),
        ]);

        assertEquals(block.receipts.length, 8);
        assertEquals(block.height, 2);
        
        // No message was sent between the two users
        block.receipts[0].result
        .expectErr()
        .expectList()

        // Message sent successfully  ummar->ahmed
        block.receipts[1].result
        .expectOk()
        .expectBool(true)
        
        // Expect Ok and a List since a message was sent previously by ummar
        block.receipts[2].result
        .expectOk()
        .expectList()

        // Message sent successfully  ummar->ahmed
        block.receipts[3].result
        .expectOk()
        .expectBool(true)

        // Expect Ok and a List since two messages were sent previously by ummar
        block.receipts[4].result
        .expectOk()
        .expectList()
        
        // Message sent successfully  ahmed->ummar
        block.receipts[5].result
        .expectOk()
        .expectBool(true)

        // Expect Ok and a List since a message was recieved by ummar previously
        block.receipts[6].result
        .expectOk()
        .expectList()

        // Expect Ok and a List since two messages were recieved by ahmed previously
        block.receipts[7].result
        .expectOk()
        .expectList()
    },
});
