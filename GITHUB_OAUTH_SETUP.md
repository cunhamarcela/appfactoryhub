# Configuração do GitHub OAuth App para Desenvolvimento Local

## Problema Identificado
O erro que aparece após a autenticação era causado pelo conflito entre a URL de produção configurada no `.env` (`https://appfactoryhub.vercel.app`) e o ambiente de desenvolvimento local (`http://localhost:3000`).

## Solução Implementada
✅ Criado arquivo `.env.local` com `NEXTAUTH_URL=http://localhost:3000` que tem precedência sobre o `.env` em desenvolvimento.

## Solução

### 1. Acesse as configurações do GitHub OAuth App
1. Vá para https://github.com/settings/developers
2. Clique em "OAuth Apps"
3. Encontre o app com Client ID: `Ov23lili6e7AVDOZ8bfZ`

### 2. Configure as URLs para desenvolvimento local
Certifique-se de que as seguintes URLs estão configuradas:

**Homepage URL:**
```
http://localhost:3000
```

**Authorization callback URL:**
```
http://localhost:3000/api/auth/callback/github
```

### 3. URLs adicionais (se necessário)
Se você quiser que funcione tanto em produção quanto em desenvolvimento, adicione ambas:

**Para produção:**
- Homepage URL: `https://appfactoryhub.vercel.app`
- Callback URL: `https://appfactoryhub.vercel.app/api/auth/callback/github`

**Para desenvolvimento:**
- Homepage URL: `http://localhost:3000`
- Callback URL: `http://localhost:3000/api/auth/callback/github`

### 4. Configuração do Google OAuth (se necessário)
Para o Google OAuth, acesse https://console.cloud.google.com/apis/credentials e configure:

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
```

## Teste
Após fazer essas alterações:
1. Reinicie o servidor: `npm run dev`
2. Acesse http://localhost:3000
3. Tente fazer login com GitHub
4. O erro não deve mais aparecer após a autenticação

## Nota
O arquivo `.env` já está configurado corretamente com `NEXTAUTH_URL=http://localhost:3000` quando você roda o servidor com a variável de ambiente definida.
