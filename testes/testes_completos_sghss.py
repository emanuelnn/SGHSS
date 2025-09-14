# testes_completos_sghss.py
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import sys
import os

# CONFIGURAÇÃO GERAL
URL_BASE = "file:///C:/Users/emanu/OneDrive/SGHSS - UNINTER PROJETO FINAL/GitHub/SGHSS"
CHROME_PATH = r"C:\Users\emanu\OneDrive\SGHSS - UNINTER PROJETO FINAL\GitHub\SGHSS\testes\Chrome\chrome.exe"

# DADOS DE TESTE
CPF_ADMIN = "00000000000"
SENHA_ADMIN = "admin123"
CPF_PACIENTE = "12345678900"
NOME_PACIENTE = "Ana Souza"

HEADLESS = False

class SGHSSTestSuite:
    def __init__(self):
        self.driver = None
        self.wait = None
        self.resultados = []
        
    def setup_driver(self):
        """Configura o navegador Chrome"""
        options = webdriver.ChromeOptions()
        if HEADLESS:
            options.add_argument("--headless=new")
            options.add_argument("--disable-gpu")
        options.add_argument("--start-maximized")
        options.add_argument("--window-size=1366,768")
        options.binary_location = CHROME_PATH
        
        # Adicionar argumentos para melhor estabilidade
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-extensions")
        options.add_argument("--disable-notifications")
        
        try:
            self.driver = webdriver.Chrome(
                service=Service(ChromeDriverManager().install()), 
                options=options
            )
            self.wait = WebDriverWait(self.driver, 15)
            print("✅ Navegador configurado com sucesso")
            return True
        except Exception as e:
            print(f"❌ Erro ao configurar navegador: {e}")
            return False
    
    def find_input(self, possible_ids):
        """Tenta localizar um input por várias estratégias"""
        for locator in possible_ids:
            try:
                return self.driver.find_element(*locator)
            except Exception:
                continue
        return None
    
    def login(self, cpf=CPF_ADMIN, senha=SENHA_ADMIN):
        """Realiza login no sistema"""
        try:
            print(f"\n🔐 Realizando login com CPF: {cpf}")
            self.driver.get(f"{URL_BASE}/index.html")
            
            # Espera carregar os inputs
            self.wait.until(EC.presence_of_element_located((By.TAG_NAME, "input")))
            
            # Localiza campos de login
            possible_username_locators = [
                (By.ID, "username"),
                (By.ID, "cpf"),
                (By.NAME, "username"),
                (By.NAME, "cpf"),
                (By.CSS_SELECTOR, "input[type='text']"),
                (By.CSS_SELECTOR, "input[placeholder*='CPF']"),
                (By.CSS_SELECTOR, "input[placeholder*='cpf']"),
            ]
            
            possible_password_locators = [
                (By.ID, "password"),
                (By.NAME, "password"),
                (By.CSS_SELECTOR, "input[type='password']"),
                (By.CSS_SELECTOR, "input[placeholder*='Senha']"),
                (By.CSS_SELECTOR, "input[placeholder*='senha']"),
            ]
            
            username_input = self.find_input(possible_username_locators)
            password_input = self.find_input(possible_password_locators)
            
            if not username_input or not password_input:
                inputs = self.driver.find_elements(By.TAG_NAME, "input")
                if len(inputs) >= 2:
                    username_input = username_input or inputs[0]
                    password_input = password_input or inputs[1]
            
            if not username_input or not password_input:
                print("❌ Campos de login não encontrados")
                return False
            
            # Preenche e envia formulário
            username_input.clear()
            username_input.send_keys(cpf)
            password_input.clear()
            password_input.send_keys(senha)
            
            # Clica no botão de login
            try:
                btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
                btn.click()
            except:
                password_input.send_keys("\n")
            
            # Verifica sucesso
            try:
                self.wait.until(EC.url_contains("dashboard"))
                print("✅ Login realizado com sucesso")
                return True
            except TimeoutException:
                # Verifica se está no dashboard por elementos
                possible_post_login = [
                    (By.CSS_SELECTOR, ".dashboard"),
                    (By.XPATH, "//*[contains(text(), 'Dashboard') or contains(text(), 'Bem-vindo')]"),
                ]
                for loc in possible_post_login:
                    try:
                        self.wait.until(EC.presence_of_element_located(loc))
                        print("✅ Login realizado com sucesso")
                        return True
                    except:
                        continue
                print("❌ Login falhou")
                return False
                
        except Exception as e:
            print(f"❌ Erro no login: {e}")
            return False
    
    def test_dashboard(self):
        """Testa a página do dashboard"""
        try:
            print("\n📊 Testando Dashboard...")
            self.driver.get(f"{URL_BASE}/dashboard.html")
            
            # Verifica elementos principais
            elementos = [
                ("Cadastro Geral", "cadastro.html"),
                ("Agendar Consulta", "agendamento.html"),
                ("Ver Pacientes", "consultas.html"),
                ("Agenda Médica", "agenda.html"),
                ("Prescrições", "prescricoes.html"),
            ]
            
            for texto, link in elementos:
                try:
                    elemento = self.wait.until(EC.presence_of_element_located(
                        (By.XPATH, f"//*[contains(text(), '{texto}')]"))
                    )
                    print(f"✅ Elemento '{texto}' encontrado")
                    self.resultados.append(f"✅ Dashboard - {texto}: ENCONTRADO")
                except:
                    print(f"❌ Elemento '{texto}' não encontrado")
                    self.resultados.append(f"❌ Dashboard - {texto}: NÃO ENCONTRADO")
            
            # Verifica gráficos
            try:
                grafico = self.wait.until(EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "canvas"))
                )
                print("✅ Gráfico encontrado no dashboard")
                self.resultados.append("✅ Dashboard - Gráficos: ENCONTRADO")
            except:
                print("❌ Gráfico não encontrado no dashboard")
                self.resultados.append("❌ Dashboard - Gráficos: NÃO ENCONTRADO")
                
            return True
            
        except Exception as e:
            print(f"❌ Erro no teste do dashboard: {e}")
            return False
    
    def test_cadastro_paciente(self):
        """Testa o cadastro de pacientes"""
        try:
            print("\n👤 Testando Cadastro de Pacientes...")
            self.driver.get(f"{URL_BASE}/cadastro.html")
            
            # Preenche formulário
            self.wait.until(EC.presence_of_element_located((By.ID, "tipoUsuario")))
            
            # Seleciona tipo paciente
            select_tipo = self.driver.find_element(By.ID, "tipoUsuario")
            select_tipo.send_keys("Paciente")
            
            # Preenche dados
            campos = {
                "nome": "Teste Selenium",
                "cpf": "11111111111",
                "nascimento": "1990-01-01",
                "email": "teste.selenium@email.com",
                "senha": "senha123"
            }
            
            for campo_id, valor in campos.items():
                elemento = self.driver.find_element(By.ID, campo_id)
                elemento.clear()
                elemento.send_keys(valor)
            
            # Envia formulário
            btn_submit = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            btn_submit.click()
            
            # Verifica se foi salvo
            time.sleep(2)
            try:
                lista = self.driver.find_element(By.ID, "listaCadastros")
                if "Teste Selenium" in lista.text:
                    print("✅ Paciente cadastrado com sucesso")
                    self.resultados.append("✅ Cadastro - Paciente: CADASTRADO")
                    return True
                else:
                    print("❌ Paciente não encontrado na lista")
                    self.resultados.append("❌ Cadastro - Paciente: NÃO ENCONTRADO")
                    return False
            except:
                print("❌ Erro ao verificar lista de cadastros")
                return False
                
        except Exception as e:
            print(f"❌ Erro no teste de cadastro: {e}")
            return False
    
    def test_agendamento_consulta(self):
        """Testa o agendamento de consultas"""
        try:
            print("\n📅 Testando Agendamento de Consultas...")
            self.driver.get(f"{URL_BASE}/agendamento.html")
            
            # Espera carregar os elementos
            self.wait.until(EC.presence_of_element_located((By.ID, "nomePaciente")))
            
            # Seleciona paciente (primeiro da lista)
            select_paciente = self.driver.find_element(By.ID, "nomePaciente")
            select_paciente.send_keys(NOME_PACIENTE)
            
            # Seleciona especialidade
            select_especialidade = self.driver.find_element(By.ID, "especialidade")
            select_especialidade.send_keys("Clínico Geral")
            
            # Seleciona data e hora
            data_input = self.driver.find_element(By.ID, "dataConsulta")
            data_input.clear()
            data_input.send_keys("2025-12-20")
            
            hora_input = self.driver.find_element(By.ID, "horaConsulta")
            hora_input.clear()
            hora_input.send_keys("14:30")
            
            # Envia formulário
            btn_submit = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            btn_submit.click()
            
            # Verifica mensagem de sucesso
            time.sleep(2)
            try:
                mensagem = self.driver.find_element(By.ID, "mensagemAgendamento")
                if "sucesso" in mensagem.text.lower():
                    print("✅ Consulta agendada com sucesso")
                    self.resultados.append("✅ Agendamento - Consulta: AGENDADA")
                    return True
                else:
                    print("❌ Mensagem de sucesso não encontrada")
                    self.resultados.append("❌ Agendamento - Consulta: FALHA")
                    return False
            except:
                print("❌ Erro ao verificar mensagem de agendamento")
                return False
                
        except Exception as e:
            print(f"❌ Erro no teste de agendamento: {e}")
            return False
    
    def test_prontuarios(self):
        """Testa o sistema de prontuários eletrônicos"""
        try:
            print("\n📋 Testando Prontuários Eletrônicos...")
            self.driver.get(f"{URL_BASE}/prontuarios.html")
            
            # Espera carregar
            self.wait.until(EC.presence_of_element_located((By.ID, "filtroPaciente")))
            
            # Busca paciente
            filtro = self.driver.find_element(By.ID, "filtroPaciente")
            filtro.clear()
            filtro.send_keys(NOME_PACIENTE)
            
            time.sleep(1)
            
            # Seleciona paciente na lista
            try:
                paciente_item = self.driver.find_element(By.XPATH, f"//*[contains(text(), '{NOME_PACIENTE}')]")
                paciente_item.click()
                print("✅ Paciente selecionado")
            except:
                print("❌ Paciente não encontrado na lista")
                return False
            
            # Acessa prontuário
            time.sleep(1)
            try:
                visualizar_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Visualizar Prontuário')]")
                visualizar_btn.click()
                print("✅ Acessando prontuário")
            except:
                print("❌ Botão de visualizar não encontrado")
                return False
            
            # Verifica se está na aba de visualização
            time.sleep(2)
            try:
                aba_visualizar = self.driver.find_element(By.ID, "visualizar-tab")
                if "active" in aba_visualizar.get_attribute("class"):
                    print("✅ Prontuário acessado com sucesso")
                    self.resultados.append("✅ Prontuários - Acesso: SUCESSO")
                    return True
                else:
                    print("❌ Não foi possível acessar o prontuário")
                    self.resultados.append("❌ Prontuários - Acesso: FALHA")
                    return False
            except:
                print("❌ Erro ao verificar aba de prontuário")
                return False
                
        except Exception as e:
            print(f"❌ Erro no teste de prontuários: {e}")
            return False
    
    def test_relatorios(self):
        """Testa o sistema de relatórios financeiros"""
        try:
            print("\n📈 Testando Relatórios Financeiros...")
            self.driver.get(f"{URL_BASE}/relatorios.html")
            
            # Espera carregar
            self.wait.until(EC.presence_of_element_located((By.ID, "periodo")))
            
            # Seleciona período
            periodo = self.driver.find_element(By.ID, "periodo")
            periodo.send_keys("Mês Atual")
            
            # Seleciona tipo de relatório
            tipo_relatorio = self.driver.find_element(By.ID, "tipoRelatorio")
            tipo_relatorio.send_keys("Geral")
            
            # Atualiza relatório
            btn_atualizar = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Atualizar')]")
            btn_atualizar.click()
            
            # Espera carregar gráficos
            time.sleep(3)
            
            # Verifica gráficos
            try:
                grafico_receita = self.driver.find_element(By.ID, "graficoReceita")
                print("✅ Gráfico de receita encontrado")
                self.resultados.append("✅ Relatórios - Gráfico Receita: ENCONTRADO")
            except:
                print("❌ Gráfico de receita não encontrado")
                self.resultados.append("❌ Relatórios - Gráfico Receita: NÃO ENCONTRADO")
            
            # Verifica tabela
            try:
                tabela = self.driver.find_element(By.ID, "tabelaTransacoes")
                if "Transações" in tabela.text:
                    print("✅ Tabela de transações encontrada")
                    self.resultados.append("✅ Relatórios - Tabela: ENCONTRADA")
                else:
                    print("❌ Tabela de transações não encontrada")
                    self.resultados.append("❌ Relatórios - Tabela: NÃO ENCONTRADA")
            except:
                print("❌ Erro ao verificar tabela de transações")
                self.resultados.append("❌ Relatórios - Tabela: ERRO")
            
            # Testa exportação
            try:
                btn_exportar = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Exportar')]")
                btn_exportar.click()
                print("✅ Botão de exportação encontrado")
                self.resultados.append("✅ Relatórios - Exportação: BOTÃO ENCONTRADO")
            except:
                print("❌ Botão de exportação não encontrado")
                self.resultados.append("❌ Relatórios - Exportação: BOTÃO NÃO ENCONTRADO")
            
            return True
            
        except Exception as e:
            print(f"❌ Erro no teste de relatórios: {e}")
            return False
    
    def test_consultas_pacientes(self):
        """Testa a página de consultas e pacientes"""
        try:
            print("\n🏥 Testando Consultas e Pacientes...")
            self.driver.get(f"{URL_BASE}/consultas.html")
            
            # Espera carregar
            self.wait.until(EC.presence_of_element_located((By.ID, "pacienteList")))
            
            # Verifica abas
            try:
                aba_pacientes = self.driver.find_element(By.ID, "pacientes-tab")
                aba_consultas = self.driver.find_element(By.ID, "consultas-tab")
                
                if "active" in aba_pacientes.get_attribute("class"):
                    print("✅ Aba 'Pacientes' ativa")
                else:
                    print("❌ Aba 'Pacientes' não está ativa")
                
                if "active" not in aba_consultas.get_attribute("class"):
                    print("✅ Aba 'Consultas' inativa (correto)")
                else:
                    print("❌ Aba 'Consultas' está ativa (incorreto)")
                    
            except Exception as e:
                print(f"❌ Erro ao verificar abas: {e}")
            
            # Verifica lista de pacientes
            try:
                lista_pacientes = self.driver.find_element(By.ID, "pacienteList")
                if lista_pacientes.text:
                    print("✅ Lista de pacientes populada")
                    self.resultados.append("✅ Consultas - Lista Pacientes: POPULADA")
                else:
                    print("❌ Lista de pacientes vazia")
                    self.resultados.append("❌ Consultas - Lista Pacientes: VAZIA")
            except:
                print("❌ Erro ao verificar lista de pacientes")
                self.resultados.append("❌ Consultas - Lista Pacientes: ERRO")
            
            # Muda para aba de consultas
            try:
                aba_consultas.click()
                time.sleep(1)
                
                lista_consultas = self.driver.find_element(By.ID, "consultaList")
                if lista_consultas.text:
                    print("✅ Lista de consultas populada")
                    self.resultados.append("✅ Consultas - Lista Consultas: POPULADA")
                else:
                    print("❌ Lista de consultas vazia")
                    self.resultados.append("❌ Consultas - Lista Consultas: VAZIA")
                    
            except Exception as e:
                print(f"❌ Erro ao verificar lista de consultas: {e}")
                self.resultados.append("❌ Consultas - Lista Consultas: ERRO")
            
            return True
            
        except Exception as e:
            print(f"❌ Erro no teste de consultas: {e}")
            return False
    
    def test_agenda_medica(self):
        """Testa a agenda médica"""
        try:
            print("\n🗓️ Testando Agenda Médica...")
            self.driver.get(f"{URL_BASE}/agenda.html")
            
            # Espera carregar
            self.wait.until(EC.presence_of_element_located((By.ID, "formAgenda")))
            
            # Verifica seleção de médico
            try:
                select_medico = self.driver.find_element(By.ID, "medico")
                if select_medico.text:
                    print("✅ Lista de médicos populada")
                    self.resultados.append("✅ Agenda Médica - Médicos: POPULADA")
                else:
                    print("❌ Lista de médicos vazia")
                    self.resultados.append("❌ Agenda Médica - Médicos: VAZIA")
            except:
                print("❌ Erro ao verificar lista de médicos")
                self.resultados.append("❌ Agenda Médica - Médicos: ERRO")
            
            # Verifica seleção de paciente
            try:
                select_paciente = self.driver.find_element(By.ID, "paciente")
                if select_paciente.text:
                    print("✅ Lista de pacientes populada")
                    self.resultados.append("✅ Agenda Médica - Pacientes: POPULADA")
                else:
                    print("❌ Lista de pacientes vazia")
                    self.resultados.append("❌ Agenda Médica - Pacientes: VAZIA")
            except:
                print("❌ Erro ao verificar lista de pacientes")
                self.resultados.append("❌ Agenda Médica - Pacientes: ERRO")
            
            # Verifica lista de agendas
            try:
                lista_agendas = self.driver.find_element(By.ID, "listaAgendas")
                if lista_agendas.text:
                    print("✅ Lista de agendas populada")
                    self.resultados.append("✅ Agenda Médica - Agendas: POPULADA")
                else:
                    print("❌ Lista de agendas vazia")
                    self.resultados.append("❌ Agenda Médica - Agendas: VAZIA")
            except:
                print("❌ Erro ao verificar lista de agendas")
                self.resultados.append("❌ Agenda Médica - Agendas: ERRO")
            
            return True
            
        except Exception as e:
            print(f"❌ Erro no teste de agenda médica: {e}")
            return False
    
    def test_prescricoes(self):
        """Testa o sistema de prescrições"""
        try:
            print("\n💊 Testando Prescrições Médicas...")
            self.driver.get(f"{URL_BASE}/prescricoes.html")
            
            # Espera carregar
            self.wait.until(EC.presence_of_element_located((By.ID, "formPrescricao")))
            
            # Verifica seleção de paciente
            try:
                select_paciente = self.driver.find_element(By.ID, "paciente")
                if select_paciente.text:
                    print("✅ Lista de pacientes populada")
                    self.resultados.append("✅ Prescrições - Pacientes: POPULADA")
                else:
                    print("❌ Lista de pacientes vazia")
                    self.resultados.append("❌ Prescrições - Pacientes: VAZIA")
            except:
                print("❌ Erro ao verificar lista de pacientes")
                self.resultados.append("❌ Prescrições - Pacientes: ERRO")
            
            # Verifica lista de prescrições
            try:
                lista_prescricoes = self.driver.find_element(By.ID, "listaPrescricoes")
                if lista_prescricoes.text:
                    print("✅ Lista de prescrições populada")
                    self.resultados.append("✅ Prescrições - Lista: POPULADA")
                else:
                    print("❌ Lista de prescrições vazia")
                    self.resultados.append("❌ Prescrições - Lista: VAZIA")
            except:
                print("❌ Erro ao verificar lista de prescrições")
                self.resultados.append("❌ Prescrições - Lista: ERRO")
            
            return True
            
        except Exception as e:
            print(f"❌ Erro no teste de prescrições: {e}")
            return False
    
    def test_responsividade(self):
        """Testa a responsividade do sistema"""
        try:
            print("\n📱 Testando Responsividade...")
            
            # Testa diferentes tamanhos de tela
            tamanhos = [
                (1920, 1080, "Desktop"),
                (768, 1024, "Tablet"),
                (375, 667, "Mobile")
            ]
            
            for largura, altura, dispositivo in tamanhos:
                print(f"\n🔍 Testando em {dispositivo} ({largura}x{altura})...")
                
                # Redimensiona janela
                self.driver.set_window_size(largura, altura)
                time.sleep(1)
                
                # Acessa dashboard
                self.driver.get(f"{URL_BASE}/dashboard.html")
                time.sleep(2)
                
                # Verifica se elementos principais estão visíveis
                try:
                    # Verifica se o conteúdo está visível
                    conteudo = self.driver.find_element(By.CSS_SELECTOR, ".dashboard-card")
                    if conteudo.is_displayed():
                        print(f"✅ Dashboard visível em {dispositivo}")
                        self.resultados.append(f"✅ Responsividade - {dispositivo}: VISÍVEL")
                    else:
                        print(f"❌ Dashboard não visível em {dispositivo}")
                        self.resultados.append(f"❌ Responsividade - {dispositivo}: NÃO VISÍVEL")
                except:
                    print(f"❌ Erro ao verificar dashboard em {dispositivo}")
                    self.resultados.append(f"❌ Responsividade - {dispositivo}: ERRO")
                
                # Verifica se elementos não estão quebrados
                try:
                    elementos = self.driver.find_elements(By.CSS_SELECTOR, ".option-card")
                    elementos_visiveis = sum(1 for elem in elementos if elem.is_displayed())
                    print(f"✅ {elementos_visiveis} cards visíveis em {dispositivo}")
                except:
                    print(f"❌ Erro ao verificar cards em {dispositivo}")
            
            # Restaura tamanho original
            self.driver.maximize_window()
            
            return True
            
        except Exception as e:
            print(f"❌ Erro no teste de responsividade: {e}")
            return False
    
    def run_all_tests(self):
        """Executa todos os testes"""
        print("🚀 Iniciando Suite de Testes SGHSS")
        print("=" * 50)
        
        if not self.setup_driver():
            print("❌ Falha ao configurar navegador")
            return False
        
        try:
            # Realiza login
            if not self.login():
                print("❌ Login falhou. Abortando testes.")
                return False
            
            # Executa testes individuais
            testes = [
                ("Dashboard", self.test_dashboard),
                ("Cadastro de Pacientes", self.test_cadastro_paciente),
                ("Agendamento de Consultas", self.test_agendamento_consulta),
                ("Prontuários Eletrônicos", self.test_prontuarios),
                ("Relatórios Financeiros", self.test_relatorios),
                ("Consultas e Pacientes", self.test_consultas_pacientes),
                ("Agenda Médica", self.test_agenda_medica),
                ("Prescrições Médicas", self.test_prescricoes),
                ("Responsividade", self.test_responsividade)
            ]
            
            for nome_teste, funcao_teste in testes:
                try:
                    funcao_teste()
                except Exception as e:
                    print(f"❌ Erro crítico no teste '{nome_teste}': {e}")
                    self.resultados.append(f"❌ {nome_teste}: ERRO CRÍTICO - {str(e)}")
            
            # Gera relatório final
            print("\n" + "=" * 50)
            print("📋 RELATÓRIO FINAL DE TESTES")
            print("=" * 50)
            
            total_testes = len(self.resultados)
            testes_sucesso = sum(1 for resultado in self.resultados if resultado.startswith("✅"))
            testes_falha = total_testes - testes_sucesso
            
            print(f"Total de testes executados: {total_testes}")
            print(f"Testes bem-sucedidos: {testes_sucesso}")
            print(f"Testes falhados: {testes_falha}")
            print(f"Taxa de sucesso: {(testes_sucesso/total_testes)*100:.1f}%")
            
            print("\n📊 Detalhamento dos resultados:")
            for resultado in self.resultados:
                print(f"  {resultado}")
            
            # Salva relatório em arquivo
            with open("relatorio_testes.txt", "w", encoding="utf-8") as f:
                f.write("RELATÓRIO DE TESTES SGHSS\n")
                f.write("=" * 30 + "\n\n")
                f.write(f"Data: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"Total de testes: {total_testes}\n")
                f.write(f"Sucessos: {testes_sucesso}\n")
                f.write(f"Falhas: {testes_falha}\n")
                f.write(f"Taxa de sucesso: {(testes_sucesso/total_testes)*100:.1f}%\n\n")
                f.write("Resultados detalhados:\n")
                f.write("-" * 30 + "\n")
                for resultado in self.resultados:
                    f.write(f"{resultado}\n")
            
            print(f"\n💾 Relatório salvo em: relatorio_testes.txt")
            
            return testes_sucesso > 0
            
        except Exception as e:
            print(f"❌ Erro na execução dos testes: {e}")
            return False
        
        finally:
            if self.driver:
                if not HEADLESS:
                    input("\nPressione Enter para fechar o navegador...")
                self.driver.quit()

def main():
    """Função principal"""
    suite = SGHSSTestSuite()
    sucesso = suite.run_all_tests()
    
    if sucesso:
        print("\n🎉 Suite de testes concluída com sucesso!")
        sys.exit(0)
    else:
        print("\n❌ Suite de testes falhou!")
        sys.exit(1)

if __name__ == "__main__":
    main()