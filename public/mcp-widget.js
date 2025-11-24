// MCP Widget Script for Product Display
window.addEventListener('message', function(event) {
  if (event.origin !== 'https://chatgpt.com') return;

  if (event.data.type === 'mcp:product:show') {
    const product = event.data.product;
    renderProduct(product);
  }
});

function renderProduct(product) {
  const container = document.getElementById('tanstack-app-root');
  if (!container) return;

  // Create product display
  const productHTML = `
    <div style="max-width: 300px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
      ${product.image_url ? `
        <div style="aspect-ratio: 1; background: #f8f9fa;">
          <img src="${product.image_url}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
        </div>
      ` : ''}
      <div style="padding: 16px;">
        <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${product.name}</h3>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; text-transform: capitalize;">${product.category}</p>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #374151; line-height: 1.4;">${product.description || 'No description available'}</p>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 18px; font-weight: bold; color: #059669;">${product.price} ${product.currency}</span>
          <span style="font-size: 12px; padding: 4px 8px; border-radius: 4px; background: ${product.in_stock ? '#dcfce7' : '#fee2e2'}; color: ${product.in_stock ? '#166534' : '#dc2626'};">
            ${product.in_stock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        ${product.product_url ? `
          <a href="${product.product_url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; width: 100%; background: #2563eb; color: white; padding: 8px 16px; border-radius: 6px; text-align: center; text-decoration: none; font-weight: 500;">View Product</a>
        ` : ''}
      </div>
    </div>
  `;

  container.innerHTML = productHTML;
}
