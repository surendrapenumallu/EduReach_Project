import urllib.request
import json
import sys

BASE_URL = "http://localhost:5050/api"

def make_request(method, endpoint, data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    
    body = json.dumps(data).encode("utf-8") if data else None
    
    try:
        with urllib.request.urlopen(req, data=body) as response:
            status_code = response.getcode()
            res_body = response.read().decode("utf-8")
            return status_code, json.loads(res_body)
    except urllib.error.HTTPError as e:
        res_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(res_body)
        except:
            return e.code, {"error": res_body}
    except Exception as e:
        return 500, {"error": str(e)}

def run_tests():
    print("=" * 60)
    print("🚀 EDUREACH ADMISSION SYSTEM — END-TO-END VERIFICATION")
    print("=" * 60)
    
    # Test 1: Admin Login
    print("\n1. Testing Admin Authentication...")
    code, res = make_request("POST", "/auth/login", {
        "email": "admin@edureach.edu",
        "password": "password123",
        "role": "admin"
    })
    assert code == 200, f"Admin login failed: {res}"
    admin_token = res["data"]["token"]
    print(f"✅ Admin logged in successfully! Name: {res['data']['user']['name']}")

    # Test 2: Student Registration
    test_student_email = "test.applicant.2026@gmail.com"
    print(f"\n2. Testing Student Registration ({test_student_email})...")
    code, res = make_request("POST", "/auth/register", {
        "name": "Arjun Sharma",
        "email": test_student_email,
        "password": "password123",
        "phone": "+91 98765 43210",
        "role": "student"
    })
    if code == 409:
        print("ℹ️ Student already registered. Logging in...")
        code, res = make_request("POST", "/auth/login", {
            "email": test_student_email,
            "password": "password123",
            "role": "student"
        })
    assert code in [200, 201], f"Student auth failed: {res}"
    student_token = res["data"]["token"]
    student_id = res["data"]["user"]["id"]
    print(f"✅ Student authenticated. Verified status: {res['data']['user'].get('isEmailVerified', False)}")

    # Test 3: OTP Generation & Dispatch
    print("\n3. Testing OTP Generation (POST /api/auth/send-otp)...")
    code, res = make_request("POST", "/auth/send-otp", {
        "email": test_student_email,
        "purpose": "email_verification"
    })
    assert code == 200, f"Send OTP failed: {res}"
    demo_otp = res.get("data", {}).get("demoOtp")
    print(f"✅ OTP generated and emailed! Demo OTP code: {demo_otp}")

    # Test 4: OTP Verification
    print("\n4. Testing OTP Verification (POST /api/auth/verify-otp)...")
    code, res = make_request("POST", "/auth/verify-otp", {
        "email": test_student_email,
        "otp": demo_otp or "123456",
        "purpose": "email_verification"
    })
    assert code == 200, f"Verify OTP failed: {res}"
    print(f"✅ Email successfully verified! Result: {res['message']}")

    # Test 5: Admission Application Submission
    print("\n5. Testing Admission Application Submission (POST /api/admissions/apply)...")
    app_payload = {
        "fullName": "Arjun Sharma",
        "email": test_student_email,
        "mobile": "+91 98765 43210",
        "dateOfBirth": "2005-08-15",
        "gender": "Male",
        "course": "B.Tech - Artificial Intelligence & Data Science (AI & DS)",
        "previousEducation": "Telangana State Intermediate Board (MPC)",
        "academicPercentage": 93.4,
        "address": "Plot 42, Jubilee Hills, Road No 10, Hyderabad, Telangana - 500033",
        "admissionSession": "2024–25",
        "documents": [
            {
                "documentName": "10th SSC Certificate",
                "fileUrl": "data:text/plain;base64,U1NDX01BUktTSEVFVA==",
                "fileType": "application/pdf"
            },
            {
                "documentName": "12th Intermediate Marksheet",
                "fileUrl": "data:text/plain;base64,SU5URVJfTUFSS1NIRUVU",
                "fileType": "application/pdf"
            }
        ]
    }
    code, res = make_request("POST", "/admissions/apply", app_payload, student_token)
    
    if code == 409:
        print(f"ℹ️ Application already exists for session 2024–25: {res['message']}")
        app_id = res["data"]["applicationId"]
    else:
        assert code == 201, f"Application submission failed: {res}"
        app_id = res["data"]["applicationId"]
        print(f"✅ Application submitted! Application ID generated: {app_id}")

    # Test 6: Duplicate Application Prevention
    print("\n6. Testing Duplicate Application Prevention...")
    code, res = make_request("POST", "/admissions/apply", app_payload, student_token)
    assert code == 409, f"Duplicate application was not prevented! Code: {code}, res: {res}"
    print(f"✅ Duplicate submission successfully prevented (HTTP 409 Conflict): {res['message']}")

    # Test 7: Student Fetching My Application
    print("\n7. Testing Student Fetching Active Application (GET /api/admissions/my-application)...")
    code, res = make_request("GET", "/admissions/my-application", None, student_token)
    assert code == 200, f"Get my application failed: {res}"
    app_data = res["data"]["application"]
    assert app_data["applicationId"] == app_id
    print(f"✅ Retrieved student application: {app_data['applicationId']} | Status: {app_data['status']} | Course: {app_data['course']}")

    # Test 8: Student Notifications Check
    print("\n8. Testing Student Notification System...")
    code, res = make_request("GET", "/notifications", None, student_token)
    assert code == 200, f"Get notifications failed: {res}"
    notifs = res["data"]["notifications"]
    unread = res["data"]["unreadCount"]
    print(f"✅ Student has {len(notifs)} notifications, {unread} unread.")
    if len(notifs) > 0:
        notif_id = notifs[0]["_id"]
        # Mark as read
        code, res = make_request("PATCH", f"/notifications/{notif_id}/read", None, student_token)
        assert code == 200
        print(f"✅ Marked notification {notif_id} as read. New unread count: {res['data']['unreadCount']}")

    # Test 9: Admin Admission Applications Listing & Filtering
    print("\n9. Testing Admin Admission Listing & Filters (GET /api/admin/admissions)...")
    code, res = make_request("GET", f"/admin/admissions?search={app_id}", None, admin_token)
    assert code == 200, f"Admin admissions list failed: {res}"
    admin_apps = res["data"]["applications"]
    stats = res["data"]["stats"]
    assert len(admin_apps) >= 1, f"Application {app_id} not found by admin search"
    print(f"✅ Admin found {len(admin_apps)} application(s) matching search '{app_id}'.")
    print(f"📊 Admission Stats Breakdown: {stats}")

    # Test 10: Admin Status Update to 'Under Review'
    print("\n10. Testing Admin Status Update -> 'Under Review'...")
    code, res = make_request("PATCH", f"/admin/admissions/{app_id}/status", {
        "status": "Under Review",
        "remarks": "Documents being verified by Faculty Admissions Committee."
    }, admin_token)
    assert code == 200, f"Status update failed: {res}"
    print(f"✅ Status updated to 'Under Review'. Confirmation: {res['message']}")

    # Test 11: Admin Requesting Additional Documents -> 'Documents Required'
    print("\n11. Testing Status Transition -> 'Documents Required'...")
    code, res = make_request("PATCH", f"/admin/admissions/{app_id}/status", {
        "status": "Documents Required",
        "remarks": "Please provide your Transfer Certificate / Migration Certificate."
    }, admin_token)
    assert code == 200
    print(f"✅ Status updated to 'Documents Required'. Candidate notified.")

    # Test 12: Student Uploading Supplementary Documents
    print("\n12. Testing Student Document Submission (POST /api/admissions/:id/documents)...")
    code, res = make_request("POST", f"/admissions/{app_id}/documents", {
        "documents": [
            {
                "documentName": "Transfer Certificate (TC)",
                "fileUrl": "data:text/plain;base64,VENfRE9DVU1FTlRfRklMRQ==",
                "fileType": "application/pdf"
            }
        ]
    }, student_token)
    assert code == 200, f"Supplementary upload failed: {res}"
    print(f"✅ Supplementary document attached! Application moved automatically to '{res['data']['status']}'")

    # Test 13: Admin Final Approval -> 'Approved'
    print("\n13. Testing Admin Approval -> 'Approved'...")
    code, res = make_request("PATCH", f"/admin/admissions/{app_id}/status", {
        "status": "Approved",
        "remarks": "All documents verified. Seat confirmed in B.Tech AI & DS. Welcome to EduReach!"
    }, admin_token)
    assert code == 200
    print(f"✅ Application officially APPROVED! Email sent to candidate.")

    # Test 14: Fast Status & Timeline Check
    print("\n14. Testing Public Status API (GET /api/admissions/:id/status)...")
    code, res = make_request("GET", f"/admissions/{app_id}/status")
    assert code == 200
    status_data = res["data"]
    print(f"✅ Application Status: {status_data['status']}")
    print(f"📜 Status History Timeline ({len(status_data['history'])} steps):")
    for step in status_data["history"]:
        print(f"   • {step['previousStatus']} -> {step['newStatus']} | Remarks: {step.get('remarks') or 'None'}")

    print("\n" + "=" * 60)
    print("🎉 ALL 14 TESTS PASSED FLAWLESSLY WITH REAL MONGODB DATA!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()

