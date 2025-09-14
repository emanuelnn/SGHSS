# Suite de Testes Selenium - SGHSS

Este diretório contém a suite de testes automatizados para o Sistema de Gestão Hospitalar e de Serviços de Saúde (SGHSS) utilizando Selenium WebDriver.

## 📁 Estrutura dos Arquivos

- `teste_login.py` - Teste básico de login (original)
- `testes_completos_sghss.py` - Suite completa de testes automatizados
- `Chrome/` - Diretório com o navegador Chrome para execução dos testes
- `relatorio_testes.txt` - Relatório gerado após execução dos testes

## 🚀 Pré-requisitos

### 1. Instalação de Dependências

```bash
# Instalar Python (se ainda não tiver)
# Baixe em: https://www.python.org/downloads/

# Instalar as bibliotecas necessárias
pip install selenium webdriver-manager
```

### 2. Configuração do Chrome

O script já está configurado para usar o Chrome localizado em:
```
C:\Users\emanu\OneDrive\SGHSS - UNINTER PROJETO FINAL\GitHub\SGHSS\testes\Chrome\chrome.exe
```

## 📋 Execução dos Testes

### Opção 1: Executar a Suite Completa

```bash
# Navegar até o diretório de testes
cd "C:\Users\emanu\OneDrive\SGHSS - UNINTER PROJETO FINAL\GitHub\SGHSS\testes"

# Executar a suite completa
python testes_completos_sghss.py
```

### Opção 2: Executar Teste de Login Individual

```bash
# Executar apenas o teste de login
python teste_login.py
```

### Opção 3: Modo Headless (Sem Interface Gráfica)

Para executar os testes sem abrir o navegador (modo em segundo plano):

```bash
# Modificar a variável HEADLESS para True no arquivo
# Em testes_completos_sghss.py, linha 17:
HEADLESS = True

# Executar os testes
python testes_completos_sghss.py
```

## 🎯 Testes Implementados

### Suite Completa (`testes_completos_sghss.py`)

1. **Login do Sistema**
   - Testa a autenticação com credenciais válidas
   - Verifica redirecionamento para o dashboard

2. **Dashboard Principal**
   - Verifica presença de todos os cards de acesso rápido
   - Confirma exibição de gráficos de consultas

3. **Cadastro de Pacientes**
   - Testa preenchimento e envio do formulário
   - Verifica se o paciente aparece na lista

4. **Agendamento de Consultas**
   - Testa seleção de paciente, especialidade, data e hora
   - Verifica mensagem de sucesso

5. **Prontuários Eletrônicos**
   - Testa busca e seleção de pacientes
   - Verifica acesso ao prontuário

6. **Relatórios Financeiros**
   - Testa filtros e atualização de relatórios
   - Verifica gráficos e tabelas

7. **Consultas e Pacientes**
   - Testa navegação entre abas
   - Verifica listas de pacientes e consultas

8. **Agenda Médica**
   - Testa seleção de médicos e pacientes
   - Verifica lista de agendamentos

9. **Prescrições Médicas**
   - Testa seleção de pacientes
   - Verifica lista de prescrições

10. **Responsividade**
    - Testa exibição em diferentes tamanhos de tela
    - Verifica elementos visíveis em Desktop, Tablet e Mobile

## 📊 Relatório de Testes

Após a execução, um relatório detalhado é gerado em `relatorio_testes.txt` com:

- Data e hora da execução
- Total de testes executados
- Quantidade de sucessos e falhas
- Taxa de sucesso
- Detalhamento de cada teste

## 🔧 Configurações Personalizáveis

### Dados de Teste

No arquivo `testes_completos_sghss.py`, você pode modificar:

```python
# Linhas 16-20
CPF_ADMIN = "00000000000"
SENHA_ADMIN = "admin123"
CPF_PACIENTE = "12345678900"
NOME_PACIENTE = "Ana Souza"
```

### URL do Sistema

```python
# Linha 12
URL_BASE = "file:///C:/Users/emanu/OneDrive/SGHSS - UNINTER PROJETO FINAL/GitHub/SGHSS"
```

### Tempo de Espera

```python
# Linha 40
self.wait = WebDriverWait(self.driver, 15)  # 15 segundos
```

## 🐛 Solução de Problemas

### Problema 1: ChromeDriver não encontrado

**Solução:** O script usa `webdriver-manager` para baixar automaticamente o ChromeDriver compatível.

### Problema 2: Páginas não carregam

**Solução:** Verifique se o caminho do arquivo HTML está correto e se os arquivos não foram movidos.

### Problema 3: Elementos não encontrados

**Solução:** Execute em modo não headless (`HEADLESS = False`) para visualizar o navegador e depurar.

### Problema 4: Permissões do Windows

**Solução:** Execute o terminal como Administrador ou conceda permissões de execução ao script.

## 📸 Capturas de Tela

Os testes automaticamente capturam screenshots em caso de erro:

- `erro_load_inputs.png` - Erro ao carregar inputs
- `login_falhou.png` - Falha no login
- `erro_unexpected.png` - Erro inesperado

## 🔄 Manutenção

### Adicionar Novos Testes

1. Criar um novo método na classe `SGHSSTestSuite`
2. Adicionar o teste na lista `testes` no método `run_all_tests`
3. Implementar as verificações necessárias

### Atualizar Seletores

Quando a interface do SGHSS mudar, atualize os seletores nos testes:

```python
# Exemplo de seletores
(By.ID, "username")
(By.CSS_SELECTOR, "input[type='text']")
(By.XPATH, "//*[contains(text(), 'Login')]")
```

## 📞 Suporte

Para dúvidas ou problemas com a execução dos testes:

1. Verifique os pré-requisitos
2. Consulte este README
3. Execute em modo headless para ver erros detalhados
4. Verifique os logs gerados no terminal

---

**Nota:** Esta suite de testes foi desenvolvida especificamente para o SGHSS e utiliza o navegador Chrome localizado no diretório `testes/Chrome/`.