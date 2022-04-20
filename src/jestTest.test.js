
function sum(a, b) {
    return a + b
}

it('should work for integers', () => {
    expect(sum(1, 1)).toBe(2)
})