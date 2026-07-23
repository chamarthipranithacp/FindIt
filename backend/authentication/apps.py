from django.apps import AppConfig

class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'

    def ready(self):
        # Prevent double-run during Django dev server auto-reload
        import os
        if os.environ.get('RUN_MAIN') == 'true':
            try:
                from findit_backend.db import db
                from .auth import hash_password

                presets = [
                    {
                        "Email": "student@findit.edu",
                        "Name": "Chamarthi Pranitha",
                        "Password": "password123",
                        "Role": "Student",
                        "TrustScore": 100
                    },
                    {
                        "Email": "faculty@findit.edu",
                        "Name": "Dr. Sarah Jenkins",
                        "Password": "password123",
                        "Role": "Faculty",
                        "TrustScore": 100
                    },
                    {
                        "Email": "security@findit.edu",
                        "Name": "K. Saiswapna",
                        "Password": "password123",
                        "Role": "Security",
                        "TrustScore": 100
                    },
                    {
                        "Email": "admin@findit.edu",
                        "Name": "System Administrator",
                        "Password": "password123",
                        "Role": "Administrator",
                        "TrustScore": 100
                    }
                ]


                for p in presets:
                    existing = db.Users.find_one({"Email": p["Email"]})
                    if not existing:
                        p_hashed = p.copy()
                        p_hashed["Password"] = hash_password(p["Password"])
                        db.Users.insert_one(p_hashed)
                        print(f"Demo preset account created: {p['Email']}")
            except Exception as e:
                print("Error setting up demo presets:", e)

