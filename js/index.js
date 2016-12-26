import xs from 'xstream';
import {run} from '@cycle/xstream-run';
import {makeDOMDriver, div, h2} from '@cycle/dom';
import soundSink from './sinks/sound';
import soundDriver from './drivers/sound';
import getRandomArbitrary from './utils/random';

function main(sources) {
    const initParty = {
        party: {
            winner: null,
            ended: false,
        },
        paddles: {
            left: 70,
            right: 70,
        },
        ball: {
            x: 150,
            y: 100,
            velX: 1,
            velY: 1
        }
    };

    const keys$ = sources.DOM.select('document').events('keydown');
    const keyA$ = keys$.filter(ev => 'KeyA' === ev.code).mapTo(1);
    const keyS$ = keys$.filter(ev => 'KeyS' === ev.code).mapTo(-1);
    const keyJ$ = keys$.filter(ev => 'KeyJ' === ev.code).mapTo(1);
    const keyK$ = keys$.filter(ev => 'KeyK' === ev.code).mapTo(-1);
    const left$ = xs.merge(keyA$, keyS$).fold((x, y) => x + y, initParty.paddles.left);
    const right$ = xs.merge(keyJ$, keyK$).fold((x, y) => x + y, initParty.paddles.right);
    const paddles$ = xs.combine(left$, right$).map((combined) => {
        return {
            left: combined[0],
            right: combined[1],
        };
    });

    const game$ = xs.combine(paddles$, xs.periodic(15))
        .map((combine) => combine[0])
        .fold((game, paddles) => {
            game.paddles = paddles;

            if (null !== game.party.winner) {
                game.party.ended = true;
                return game;
            }

            if (380 === game.ball.x) {
                game.party.winner = 'player1';
                return game;
            }

            if (0 === game.ball.x) {
                game.party.winner = 'player2';
                return game;
            }

            if (game.ball.y >= 180 || game.ball.y < 0) {
                game.ball.velY = game.ball.velY * -1;
            }

            if (75 === game.ball.x && game.ball.y >= game.paddles.left && game.ball.y <= game.paddles.left + 50) {
                game.ball.velX = game.ball.velX * -1;
                game.ball.velY = game.ball.velY + getRandomArbitrary(-1, 2);
            }

            if (305 === game.ball.x && game.ball.y >= game.paddles.right && game.ball.y <= game.paddles.right + 50) {
                game.ball.velX = game.ball.velX * -1;
                game.ball.velY = game.ball.velY + getRandomArbitrary(-1, 2);
            }

            game.ball.x = game.ball.x + game.ball.velX;
            game.ball.y = game.ball.y + game.ball.velY;

            return game;
        }, initParty)
        .filter(game => !game.party.ended)
    ;

    const sinks = {
        DOM: game$
            .map(game => {
                if (null !== game.party.winner) {
                    return h2('.winner', 'Winner: ' + game.party.winner);
                }
                return div('#playground', {}, [
                    div('.paddle-hand.left'),
                    div('.paddle-hand.right'),
                    div('#paddleA.paddle', { style: { top : game.paddles.left + 'px'} }),
                    div('#paddleB.paddle', { style: { top : game.paddles.right + 'px'} }),
                    div('#ball', { style: { top : game.ball.y + 'px', left: game.ball.x + 'px'} })
                ]);
            }),
        sound: soundSink(game$),
    };

    return sinks;
}

run(main, {
    DOM: makeDOMDriver('#game'),
    sound: soundDriver,
});
