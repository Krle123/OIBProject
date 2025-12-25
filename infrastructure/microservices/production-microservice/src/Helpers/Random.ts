export function getRandomAromaticPower(): number {
    const random = Math.random() * 5 + 1; 
    return parseFloat(random.toFixed(1));
}