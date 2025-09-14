# teste_login_corrigido.py
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import os
import sys

# CONFIGURAÇÃO
URL = "https://sghss-smoky.vercel.app"
CPF = "00000000000"
SENHA = "admin123"
HEADLESS = False

def iniciar_driver():
    """Configura e inicia o navegador"""
    options = webdriver.ChromeOptions()
    if HEADLESS:
        options.add_argument("--headless=new")
        options.add_argument("--disable-gpu")
    options.add_argument("--start-maximized")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_experimental_option("excludeSwitches", ["enable-logging"])

    # Caminho do Chrome (se estiver usando versão portátil)
    chrome_path = r"C:\ChromeTest\chrome.exe"
    if os.path.exists(chrome_path):
        options.binary_location = chrome_path
        print(f"✅ Usando Chrome em: {chrome_path}")
    else:
        print("⚠️ Chrome não encontrado no caminho especificado, usando padrão")

    return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

def testar_login(driver, wait):
    """Executa login no sistema"""
    try:
        print(f"Abrindo {URL} …")
        driver.get(URL)

        # Inputs
        wait.until(EC.presence_of_element_located((By.ID, "username")))
        wait.until(EC.presence_of_element_located((By.ID, "password")))
        print("✅ Inputs carregados")

        # Preenche login
        user = driver.find_element(By.ID, "username")
        pwd = driver.find_element(By.ID, "password")
        user.clear(); user.send_keys(CPF)
        pwd.clear(); pwd.send_keys(SENHA)
        print("✅ Credenciais inseridas")

        # Botão Entrar
        btn = driver.find_element(By.CSS_SELECTOR, "button.btn-login")
        btn.click()
        print("✅ Botão 'Entrar' clicado")

        # Verifica sucesso
        try:
            wait.until(EC.url_contains("dashboard"))
            print("✅ Login realizado com sucesso!")
        except:
            print("⚠️ 'dashboard' Não encontrado!")

        driver.save_screenshot("login_result.png")
        print("✅ Screenshot salva: login_result.png")

        return True
    except Exception as e:
        print(f"❌ Erro no teste de login: {e}")
        driver.save_screenshot("erro_login.png")
        return False

def testar_dashboard(driver, wait):
    """Testa elementos do dashboard"""
    resultados = []
    try:
        print("\n Testando Dashboard...")
        driver.get("https://sghss-smoky.vercel.app/dashboard.html")

        # Elementos principais
        elementos = [
            ("Cadastro de Usuários", "cadastro.html"),
            ("Agendar Consulta", "consultas-unificadas.html"),
            ("Prontuários Eletrônicos", "prontuarios.html"),
            ("Gestão de Leitos", "leitos.html"),
            ("Prescrições Médicas", "prescricoes.html"),
        ]

        for texto, link in elementos:
            try:
                wait.until(EC.presence_of_element_located((By.XPATH, f"//*[contains(text(), '{texto}')]")))
                print(f"✅ Elemento '{texto}' encontrado")
                resultados.append(f"✅ Dashboard - {texto}: ENCONTRADO")
            except:
                print(f"❌ Elemento '{texto}' não encontrado")
                resultados.append(f"❌ Dashboard - {texto}: NÃO ENCONTRADO")

        # Gráficos
        try:
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "canvas")))
            print("✅ Gráfico encontrado no dashboard")
            resultados.append("✅ Dashboard - Gráficos: ENCONTRADO")
        except:
            print("❌ Gráfico não encontrado no dashboard")
            resultados.append("❌ Dashboard - Gráficos: NÃO ENCONTRADO")

    except Exception as e:
        print(f"❌ Erro no teste do dashboard: {e}")
        resultados.append(f"❌ Erro geral: {e}")

    return resultados

if __name__ == "__main__":
    print("✅ Iniciando teste de login SGHSS...")
    driver = iniciar_driver()
    wait = WebDriverWait(driver, 10)

    try:
        if testar_login(driver, wait):
            resultados_dashboard = testar_dashboard(driver, wait)
            print("\n📋 Resultados finais:")
            for r in resultados_dashboard:
                print(r)
    finally:
        time.sleep(5) # Pausa para visualização
        driver.quit()
        print("✅ Navegador fechado")
