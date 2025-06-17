// cypress/e2e/checkout_journey.cy.js

describe('E2E Checkout Journey - Queenbee Staging', () => {

  // Blok ini akan dijalankan sebelum setiap tes
  beforeEach(() => {
    // Mengunjungi halaman login
    cy.visit('/login');

    // Melakukan proses login menggunakan kredensial dari cypress.env.json
    cy.get('input[type="email"]').type(Cypress.env('user_email'));
    cy.get('input[type="password"]').type(Cypress.env('user_password'));
    cy.get('button[type="submit"]').contains('Masuk').click();

    // Verifikasi bahwa login berhasil dan nama user muncul
    cy.url().should('not.include', '/login');
    cy.contains('habib').should('be.visible');
  });

  it('Scenario 1: Fails to apply voucher when required product is not in cart (Negative Test)', () => {
    // Menutup modal promosi jika muncul di halaman utama
    // Menggunakan .then() untuk menangani elemen yang mungkin tidak selalu ada
    cy.get('body').then(($body) => {
      if ($body.find('div[role="dialog"]').length > 0) {
        cy.get('button[aria-label="Close"]').click({ force: true });
      }
    });

    // Menemukan produk "Fitclair Collagen Drink" dan menambahkannya ke keranjang
    // Selector ini mencari elemen yang berisi teks produk, lalu mencari tombol tambah di dalamnya
    cy.contains('h3', 'Fitclair Collagen Drink').parents('.product-card').find('button').contains('Keranjang').click();
    
    // Buka side cart untuk menambah kuantitas barang
    // Asumsi ada ikon keranjang dengan selector ini
    cy.get('.cart-icon-selector').click(); 

    // Menambah kuantitas produk menjadi 8
    // Mengklik tombol '+' sebanyak 7 kali
    cy.get('.product-in-cart-selector').within(() => {
      for (let i = 0; i < 7; i++) {
        cy.get('.quantity-plus-button').click();
      }
      // Verifikasi kuantitas sudah 8
      cy.get('input.quantity-input').should('have.value', '8');
    });

    // Verifikasi subtotal di dalam cart
    cy.contains('Subtotal').siblings('span').should('contain', 'Rp1.328.000');
    
    // Klik tombol untuk melanjutkan ke checkout
    cy.contains('button', 'Beli sekarang').click();

    // Verifikasi sudah berada di halaman checkout
    cy.url().should('include', '/checkout/shipping');
    cy.contains('h1', 'Cek pesanan').should('be.visible');

    // Memilih jasa pengiriman
    cy.contains('Pilih Layanan Pengiriman').click();
    // Memilih JNE berdasarkan screenshot (ini mungkin memerlukan selector yang lebih spesifik)
    cy.contains('.courier-option', 'JNE').click();

    // Verifikasi total pembayaran sudah termasuk ongkir (Rp1.328.000 + Rp57.000)
    cy.contains('Total pembayaran').parent().find('p.final-price').should('contain', 'Rp 1.385.000');

    // Mencoba memasukkan voucher yang tidak valid untuk keranjang ini
    cy.contains('Masukkkan kode atau pilih voucher').click();
    cy.get('input[placeholder="Masukkan kode promo"]').type('QRP-TEST-123');
    cy.contains('button', 'Cari').click();

    // Verifikasi bahwa pesan error yang benar (sesuai screenshot) muncul
    cy.contains('Tidak ada voucher').should('be.visible');
  });

  // Tes ini diskip, tapi ini adalah contoh untuk skenario positif
  it.skip('Scenario 2: Successfully applies voucher when all conditions are met (Positive Test)', () => {
    // 1. Tambahkan produk "Louissen drink" ke keranjang
    // cy.contains('h3', 'Louissen drink')...
    
    // 2. Pastikan total belanja > Rp1.250.000

    // 3. Lanjutkan ke Checkout dan pilih pengiriman

    // 4. Masukkan kode voucher 'QRP-TEST-123'
    
    // 5. Verifikasi bahwa voucher berhasil diterapkan (misal, biaya pengiriman menjadi Rp0)
    // cy.contains('Biaya Pengiriman').siblings('p').should('contain', 'Rp0');
  });

});
