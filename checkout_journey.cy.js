describe('E2E Full Checkout Journey - Queenbee Staging', () => {

  // Blok ini akan dijalankan sebelum tes utama untuk login
  beforeEach(() => {
    cy.visit('/login');

    // Klik tab "Email"
    cy.get('#page-login__tabs-tab-email').click(); 

    // Mengisi form login menggunakan ID selector yang spesifik
    cy.get('#page-login__tabs-email__input-email').type(Cypress.env('user_email'));
    cy.get('#page-login__tabs-email__input-password').type(Cypress.env('user_password'));
    cy.get('#page-login__button-login').click();

    // Verifikasi bahwa login berhasil
    cy.url().should('not.include', '/login');
    // Verifikasi dengan cara yang lebih stabil daripada hardcode nama 'habib'
    cy.get('.menu-right').find('svg').should('be.visible'); 
  });

  it('should allow user to add product, select shipping, and fail to apply voucher correctly', () => {
    // Langkah 1: Handle Cookie Banner jika muncul
    cy.get('body').then(($body) => {
      if ($body.find('.css-1vd84sn').length > 0) {
        cy.contains('button', 'Izinkan semua cookies').click();
      }
    });

    // Langkah 2: Menambahkan 7 item "Fitclair Collagen Drink" ke keranjang
    cy.log('--- Adding Product to Cart ---');
    // Cari kartu produk "Fitclair Collagen Drink"
    const productCard = cy.contains('h2', 'Fitclair Collagen Drink')
                          .parents('.styles_product__product-container__vLAe3');

    // Klik tombol "Keranjang" sebanyak 7 kali
    for (let i = 0; i < 7; i++) {
        productCard.find('button.ButtonKeranjangQbee_add-to-cart__H_haT').click();
        cy.wait(200); // Beri jeda agar sistem sempat merespon
    }
    
    // Verifikasi counter pada kartu produk menunjukkan angka "7"
    productCard.find('.ButtonKeranjangQbee_counter-label__T0ZbC')
               .should('be.visible')
               .and('contain', '7');

    // Langkah 3: Buka Side Cart dan verifikasi isinya
    cy.log('--- Verifying Side Cart ---');
    cy.get('.HeaderQbee_total-cart__Acy0A').click();

    // Gunakan .within() untuk membatasi pencarian di dalam side cart
    // Ganti '.side-cart-selector' dengan class/id container side cart yang sebenarnya
    cy.get('.side-cart-selector').within(() => {
      // Verifikasi subtotal di dalam side cart
      cy.get('.style_subtotal-container___q8z5')
        .should('be.visible')
        .and('contain', 'Subtotal (7):')
        .and('contain', 'Rp1.162.000');

      // Klik tombol "Beli sekarang" untuk ke halaman checkout
      cy.contains('button', 'Beli sekarang').click();
    });

    // Langkah 4: Halaman Checkout - Pilih Pengiriman
    cy.log('--- Selecting Shipping on Checkout Page ---');
    cy.url().should('include', '/checkout/shipping');

    cy.contains('Pilih Layanan Pengiriman').click();
    cy.wait(500);
    cy.contains('Regular').click();
    cy.wait(500);
    // Cari kurir 'jnt' (case-insensitive) dan klik
    cy.contains('.css-70qvj9', /jnt/i).click();

    // Langkah 5: Halaman Checkout - Verifikasi Ringkasan dan Total Biaya
    cy.log('--- Verifying Order Summary and Total ---');
    
    // Verifikasi blok ringkasan pesanan
    cy.get('.styles_checkout-summary__8OZk2').within(() => {
      cy.contains('p', 'Harga Produk (7 Barang)').siblings('p').should('have.text', 'Rp1.260.000');
      cy.contains('p', 'Diskon Produk').siblings('p').should('have.text', '-Rp98.000');
      cy.contains('h1', 'Subtotal Belanja').siblings('p').should('have.text', 'Rp1.162.000');
      cy.contains('p', 'Biaya Pengiriman (2.80 Kg)').siblings('p').should('have.text', 'Rp10.000');
    });

    // Verifikasi blok total pembayaran
    cy.get('.styles_checkout-total__4YPYF').within(() => {
      cy.contains('h1', 'Total pembayaran')
        .parent()
        .siblings('p.styles_checkout-summary-total__9WH9V')
        .should('contain.text', '1.172.000');
    });

    // Langkah 6: Halaman Checkout - Mencoba Voucher (Skenario Negatif)
    cy.log('--- Attempting to Apply Voucher ---');
    
    cy.contains('p', 'Masukkan kode atau pilih voucher').click();
    cy.wait(500);
    cy.get('input[placeholder="Masukkan kode promo"]').type('QRP-TEST-123');
    cy.contains('button', 'Cari').click();
    
    // Verifikasi pesan error voucher muncul
    cy.contains('Tidak ada voucher').should('be.visible');
  });
});
