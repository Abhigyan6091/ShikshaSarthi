# Security Policy

## 🔒 Supported Versions

We provide security patches and updates for the following versions of ShikshaSarthi:

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| < 1.2   | :x:                |

---

## 🛡️ Reporting a Vulnerability

If you discover a security vulnerability in ShikshaSarthi, please follow these guidelines:

1. **Do not create a public GitHub issue**.
2. Email details of the vulnerability to the project maintainers or open a private GitHub Security Advisory.
3. Provide a detailed summary including:
   - Affected component (Frontend, Backend API, Sync Service, Installer, Docker).
   - Step-by-step reproduction steps or Proof of Concept (PoC).
   - Potential impact on student/school privacy or system integrity.

We will acknowledge receipt within 48 hours and work with you to release a patched version promptly.

---

## 🏫 Local School Deployment Security Best Practices

When deploying ShikshaSarthi in a school LAN environment:
- **Change Default Credentials**: Never deploy with default passwords or sample JWT secrets.
- **LAN Segmentation**: Ensure the local server is on a dedicated school network subnet.
- **Firewall Restrictions**: Expose only the required HTTP port (default: `6050` or `6091`) to students and restrict MongoDB (`27017`) access to `127.0.0.1`.
- **Regular Backups**: Run `./scripts/backup-local-school.sh` on a regular schedule to preserve student progress offline.
