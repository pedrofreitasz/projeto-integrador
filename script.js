// Alternar visibilidade da senha
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Ícone de atualização
    const svg = this.querySelector('svg');
    if (type === 'text') {
        // Mostrar ícone de desativação do olhar
        svg.innerHTML = `
            <path d="M17.94 17.94C16.23 19.24 14.19 20 12 20C5 20 1 12 1 12C2.73 8.06 6.39 5.19 10.6 4.06M22 12C22 12 18 20 12 20C11.34 20 10.72 19.88 10.14 19.66" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M1 1L23 23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 9C8.47 9.47 8.12 10.2 8.12 11C8.12 12.66 9.34 14 11 14C11.8 14 12.53 13.65 13 13.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        `;
    } else {
        // Ícone de olhar
        svg.innerHTML = `
            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        `;
    }
});

// Envio do formulário
const loginForm = document.querySelector('.login-form');
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Adicione sua lógica de login aqui
    console.log('Login submitted');
});

