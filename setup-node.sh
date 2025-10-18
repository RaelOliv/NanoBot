#!/data/data/com.termux/files/usr/bin/bash

# Instala dependências básicas
pkg update -y && pkg upgrade -y
pkg install curl git -y

# Remove Node.js quebrado (caso esteja instalado)
pkg uninstall -y nodejs

# Instala o NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Configura perfil
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.profile
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.profile

# Carrega NVM na sessão atual
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

# Instala Node.js LTS
nvm install --lts
nvm use --lts
nvm alias default 'lts/*'

# Verifica versões
node -v
npm -v

# Instala nodemon local/global (você escolhe)
npm install -g nodemon

echo -e "\n✅ Node.js e nodemon configurados com sucesso!"
