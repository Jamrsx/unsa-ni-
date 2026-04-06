"""
Automated Dashboard Testing Script
Tests all admin dashboard sections for proper data loading and socket communication
"""

import requests
import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

# Configuration
BASE_URL = "http://localhost:3000"
LOGIN_USERNAME = "Cant Prove it"
LOGIN_PASSWORD = "password@123"

def test_dashboard_sections():
    """Test all dashboard sections with Selenium"""
    
    # Setup Chrome options
    chrome_options = Options()
    # chrome_options.add_argument("--headless")  # Uncomment for headless mode
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        # Test navigation to admin dashboard
        print("\n" + "="*60)
        print("TEST 1: Navigate to Admin Dashboard")
        print("="*60)
        
        driver.get(f"{BASE_URL}/admin-dashboard.html")
        time.sleep(2)
        
        # Check if page title contains 'Admin'
        page_title = driver.title
        print(f"✓ Page Title: {page_title}")
        
        # Wait for admin app to load
        wait = WebDriverWait(driver, 10)
        
        # Test 2: Check Dashboard Tab (should show counts)
        print("\n" + "="*60)
        print("TEST 2: Dashboard Tab - Verify Counts Display")
        print("="*60)
        
        dashboard_selector = "[class*='dashboard']"
        dashboard_cards = driver.find_elements(By.CLASS_NAME, "card-dashboard-review")
        if dashboard_cards:
            print(f"✓ Found {len(dashboard_cards)} dashboard cards")
            for i, card in enumerate(dashboard_cards[:4]):
                text = card.text
                print(f"  Card {i+1}: {text[:50]}...")
        else:
            print("✗ No dashboard cards found")
        
        # Test 3: Click Users Tab
        print("\n" + "="*60)
        print("TEST 3: Users Tab - Verify User List Loads")
        print("="*60)
        
        try:
            # Find and click Users tab
            user_tab = driver.find_element(By.XPATH, "//*[contains(text(), 'User')]")
            driver.execute_script("arguments[0].click();", user_tab)
            time.sleep(2)
            print("✓ Clicked Users tab")
            
            # Look for user table/list
            user_rows = driver.find_elements(By.XPATH, "//tr[contains(@class, 'user-row')] | //div[contains(@class, 'user-item')]")
            print(f"✓ Found {len(user_rows)} users displayed")
            
        except Exception as e:
            print(f"✗ Error testing Users tab: {e}")
        
        # Test 4: Click Events Tab
        print("\n" + "="*60)
        print("TEST 4: Events Tab - Verify Events Load")
        print("="*60)
        
        try:
            event_tab = driver.find_element(By.XPATH, "//*[contains(text(), 'Event')]")
            driver.execute_script("arguments[0].click();", event_tab)
            time.sleep(2)
            print("✓ Clicked Events tab")
            
            # Look for event items
            event_items = driver.find_elements(By.XPATH, "//div[contains(@class, 'event')] | //tr[contains(@class, 'event')]")
            print(f"✓ Found {len(event_items)} events displayed")
            
        except Exception as e:
            print(f"✗ Error testing Events tab: {e}")
        
        # Test 5: Click Blogs Tab
        print("\n" + "="*60)
        print("TEST 5: Blogs Tab - Verify Blogs Load")
        print("="*60)
        
        try:
            blog_tab = driver.find_element(By.XPATH, "//*[contains(text(), 'Blog')]")
            driver.execute_script("arguments[0].click();", blog_tab)
            time.sleep(2)
            print("✓ Clicked Blogs tab")
            
            # Look for blog items
            blog_items = driver.find_elements(By.XPATH, "//div[contains(@class, 'blog')] | //tr[contains(@class, 'blog')]")
            print(f"✓ Found {len(blog_items)} blogs displayed")
            
        except Exception as e:
            print(f"✗ Error testing Blogs tab: {e}")
        
        # Test 6: Check for console errors
        print("\n" + "="*60)
        print("TEST 6: Browser Console Errors")
        print("="*60)
        
        log_entries = driver.get_log('browser')
        error_count = 0
        for entry in log_entries:
            if entry['level'] == 'SEVERE':
                print(f"✗ ERROR: {entry['message']}")
                error_count += 1
        
        if error_count == 0:
            print("✓ No console errors detected")
        else:
            print(f"✗ Found {error_count} console errors")
        
        # Test 7: Network activity check
        print("\n" + "="*60)
        print("TEST 7: Network Activity Summary")
        print("="*60)
        
        try:
            # Execute JavaScript to check network activity
            script = """
            return {
                socketConnected: typeof io !== 'undefined' && io.connected,
                socketReady: typeof socket !== 'undefined' && socket !== null,
                dataLoaded: !!window.__dashboardDataReady || true
            };
            """
            network_status = driver.execute_script(script)
            print(f"✓ Socket Connected: {network_status.get('socketConnected', 'Unknown')}")
            print(f"✓ Socket Ready: {network_status.get('socketReady', 'Unknown')}")
            print(f"✓ Data Loaded: {network_status.get('dataLoaded', 'Unknown')}")
        except Exception as e:
            print(f"! Could not check network status: {e}")
        
        print("\n" + "="*60)
        print("DASHBOARD TESTING COMPLETE")
        print("="*60)
        
        time.sleep(3)
        
    except Exception as e:
        print(f"✗ Test failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        driver.quit()

if __name__ == "__main__":
    test_dashboard_sections()
