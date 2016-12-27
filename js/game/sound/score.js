import sounds from './library';

export default function shotLeft(game$) {
    return game$
        .filter((game) => null !== game.party.winner)
        .map(() => sounds.score);
}
