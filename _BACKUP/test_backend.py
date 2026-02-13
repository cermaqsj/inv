import requests
import json
import random

# URL del Web App (La última que proporcionó el usuario)
URL = "https://script.google.com/macros/s/AKfycbw-uXGY9Thidg9nT5DYinYhQUt64NMZw9AvIBsV6pAYtT8dc-wW4rR9wTPUUB10EtmRXQ/exec"

def test_connection():
    print(f"Testing URL: {URL}")
    try:
        # 1. Test GET (Traer Inventario basico o Tools si implementamos GET)
        # Probamos accion GET_TOOLS para verificar si el backend reconoce el comando nuevo
        payload = {"action": "GET_TOOLS"}
        print("\n[1] Testing GET_TOOLS...")
        response = requests.post(URL, json=payload, timeout=15)
        
        if response.status_code == 200:
            print("Status: 200 OK")
            try:
                data = response.json()
                print(f"Response (First 2 items): {data[:2]}")
                print("✅ GET_TOOLS connection successful.")
            except json.JSONDecodeError:
                print(f"❌ Error decoding JSON: {response.text[:200]}")
                return False
        else:
            print(f"❌ Failed with Status Code: {response.status_code}")
            print(response.text[:200])
            return False

        # 2. Test CHECK_OUT (Crear prestamo)
        worker_id = f"TestBot_{random.randint(100, 999)}"
        payload_out = {
            "action": "TOOL_CHECK_OUT",
            "worker": worker_id,
            "area": "TestLab",
            "tool": "DebugHammer",
            "comment": "Automated Test"
        }
        print(f"\n[2] Testing TOOL_CHECK_OUT for {worker_id}...")
        response_out = requests.post(URL, json=payload_out, timeout=15)
        
        tx_id = None
        if response_out.status_code == 200:
            res_json = response_out.json()
            print(f"Response: {res_json}")
            if res_json.get('status') == 'success':
                 print("✅ TOOL_CHECK_OUT successful.")
                 tx_id = res_json.get('id')
            else:
                 print("❌ TOOL_CHECK_OUT failed logic.")
        else:
             print("❌ TOOL_CHECK_OUT Network Error.")

        # 3. Test CHECK_IN (Devolucion) ONLY if we got an ID
        if tx_id:
            payload_in = {
                "action": "TOOL_CHECK_IN",
                "id": tx_id
            }
            print(f"\n[3] Testing TOOL_CHECK_IN for ID {tx_id}...")
            response_in = requests.post(URL, json=payload_in, timeout=15)
            if response_in.status_code == 200:
                print(f"Response: {response_in.json()}")
                print("✅ TOOL_CHECK_IN successful.")
            else:
                print("❌ TOOL_CHECK_IN failed.")

        return True

    except Exception as e:
        print(f"\n❌ EXCEPTION: {e}")
        return False

if __name__ == "__main__":
    test_connection()
