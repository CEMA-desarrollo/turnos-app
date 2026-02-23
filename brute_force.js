const fisios = ['A', 'B', 'C', 'D'];
const pairs = [
    ['A', 'B'], ['C', 'D'],
    ['A', 'C'], ['B', 'D'],
    ['A', 'D'], ['B', 'C']
];

function getPermutations(arr) {
    if (arr.length === 0) return [[]];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
        const rest = getPermutations(arr.slice(0, i).concat(arr.slice(i + 1)));
        for (let j = 0; j < rest.length; j++) {
            result.push([arr[i]].concat(rest[j]));
        }
    }
    return result;
}

const allPermutations = getPermutations(pairs);

let mostBalanced = [];
let bestVar = Infinity;

for (const perm of allPermutations) {
    const sequence = perm.concat(perm);
    const backToBacks = { 'A': 0, 'B': 0, 'C': 0, 'D': 0 };

    for (const f of fisios) {
        let lastSeen = -1;
        for (let i = 0; i < sequence.length; i++) {
            if (sequence[i].includes(f)) {
                if (lastSeen !== -1) {
                    const gap = i - lastSeen;
                    // Only count if it's the 1st cycle leading to the second (up to 6)
                    if (gap === 1 && i < 12) {
                        backToBacks[f]++;
                    }
                }
                lastSeen = i;
            }
        }
        // Count wrap around from element 5 to 6 as part of cycle
    }

    // Normalize back to back counts per 6-week cycle
    // B2B count in 12 weeks = 2 * B2B count per 6 weeks.
    // Actually, just looking at the transitions 0->1, 1->2 ... 5->0
    const b2b_cycle = { 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
    for (let i = 0; i < 6; i++) {
        const p1 = perm[i];
        const p2 = perm[(i + 1) % 6];
        for (const f of fisios) {
            if (p1.includes(f) && p2.includes(f)) {
                b2b_cycle[f]++;
            }
        }
    }

    const counts = Object.values(b2b_cycle);
    // Find variance of back to breaks
    const mean = counts.reduce((a, b) => a + b) / 4;
    const variance = counts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 4;

    if (variance < bestVar) {
        bestVar = variance;
        mostBalanced = [{ perm, b2b_cycle, counts }];
    } else if (variance === bestVar) {
        mostBalanced.push({ perm, b2b_cycle, counts });
    }
}

console.log("Variances found:");
console.log("Lowest Variance:", bestVar);
console.log("One of the best permutations:");
console.dir(mostBalanced[0], { depth: null });
