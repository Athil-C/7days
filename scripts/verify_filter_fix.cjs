import('../src/data/products.js').then(({ products }) => {
  import('../src/data/categories.js').then(({ isProductInShowcaseCategory }) => {
    // 1. Battery Jeep filter
    const jeepList = products.filter(p => isProductInShowcaseCategory(p, 'battery-jeep'));
    console.log('1. Showcase battery-jeep count:', jeepList.length);
    const badJeeps = jeepList.filter(p => p.name.toLowerCase().includes('aspirator') || p.name.toLowerCase().includes('bath') || p.name.toLowerCase().includes('cart') || p.name.toLowerCase().includes('sucker'));
    console.log('   Bad products in battery-jeep:', badJeeps.length);
    if (badJeeps.length > 0) {
      badJeeps.forEach(b => console.log('     * BAD:', b.name));
    }

    // 2. Tricycle filter
    const trikeList = products.filter(p => isProductInShowcaseCategory(p, 'tricycle'));
    console.log('\n2. Showcase tricycle count:', trikeList.length);
    const badTrikes = trikeList.filter(p => p.name.toLowerCase().includes('gun') || p.name.toLowerCase().includes('striker') || p.name.toLowerCase().includes('pistol'));
    console.log('   Bad products in tricycle:', badTrikes.length);
    if (badTrikes.length > 0) {
      badTrikes.forEach(b => console.log('     * BAD:', b.name));
    }

    console.log('\nAll checks completed successfully!');
  });
});
