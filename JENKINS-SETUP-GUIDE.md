# 🛠️ Guía de Configuración Jenkins para DronCakes CI/CD

## 📋 Pre-requisitos

### 1. Instalación de Jenkins

#### Opción A: Jenkins Local (Recomendado para desarrollo)
```bash
# Descargar Jenkins
# Ir a: https://www.jenkins.io/download/
# Descargar Jenkins LTS para Windows

# O usando Chocolatey (si tienes chocolatey instalado)
choco install jenkins

# Iniciar Jenkins
# Navegar a: http://localhost:8080
```

#### Opción B: Jenkins en Docker
```bash
docker run -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
```

#### Opción C: Jenkins Cloud (CloudBees, AWS CodeBuild, etc.)
- Usar un servicio cloud de Jenkins

---

## 🔧 Configuración Paso a Paso

### Paso 1: Configuración Inicial de Jenkins

1. **Acceder a Jenkins**: http://localhost:8080
2. **Desbloquear Jenkins**: Usar la contraseña inicial del log
3. **Instalar plugins sugeridos**
4. **Crear usuario admin**

### Paso 2: Instalar Plugins Necesarios

Ir a `Manage Jenkins` → `Manage Plugins` → `Available` e instalar:

```
✅ Pipeline Plugin (Multi-branch Pipeline)
✅ Git Plugin  
✅ GitHub Plugin
✅ NodeJS Plugin
✅ HTML Publisher Plugin
✅ JUnit Plugin
✅ Cobertura Plugin
✅ SonarQube Scanner Plugin (opcional)
✅ Blue Ocean Plugin (recomendado para UI moderna)
```

### Paso 3: Configurar NodeJS

1. Ir a `Manage Jenkins` → `Global Tool Configuration`
2. En la sección **NodeJS**:
   - Click "Add NodeJS"
   - Name: `Node18`
   - Version: `NodeJS 18.x.x`
   - ✅ Install automatically

### Paso 4: Configurar Credenciales

Ir a `Manage Jenkins` → `Manage Credentials` → `(global)` → `Add Credentials`:

#### GitHub Token
```
Kind: Secret text
Secret: [tu-github-token]
ID: github-token
Description: GitHub API token for notifications
```

#### Deploy Host (Simulado)
```
Kind: Secret text  
Secret: localhost
ID: deploy-host
Description: Deployment target host
```

#### SonarQube Token (Opcional)
```
Kind: Secret text
Secret: [tu-sonar-token]  
ID: sonar-token
Description: SonarQube authentication token
```

### Paso 5: Crear Multi-branch Pipeline

1. **New Item** → **Multibranch Pipeline**
2. **Name**: `DronCakes-CI-CD`
3. **Branch Sources** → **Git**:
   - **Project Repository**: `https://github.com/EstebanEr03/jenkins-ci-demo.git`
   - **Credentials**: (Si es privado, agregar credenciales)
4. **Build Configuration**:
   - **Mode**: by Jenkinsfile
   - **Script Path**: `Jenkinsfile`
5. **Scan Multibranch Pipeline Triggers**:
   - ✅ Periodically if not otherwise run
   - **Interval**: 1 minute

---

## 🚀 Configuración Específica del Proyecto

### Variables de Entorno Globales

En `Manage Jenkins` → `Configure System` → `Global Properties`:

```
NODE_VERSION=18
PROJECT_NAME=droncakes
SONAR_HOST_URL=http://localhost:9000 (si usas SonarQube)
```

### Webhook de GitHub (Opcional)

1. En tu repositorio GitHub: `Settings` → `Webhooks`
2. **Payload URL**: `http://tu-jenkins-url/github-webhook/`
3. **Content type**: application/json
4. **Events**: Push events, Pull requests

---

## 🧪 Validación de Configuración

### Test 1: Verificar que Jenkins puede acceder al repositorio

1. Ir al pipeline `DronCakes-CI-CD`
2. Click `Scan Multibranch Pipeline Now`
3. Verificar que detecta las ramas: `main`, `develop`, `staging`

### Test 2: Ejecutar pipeline en rama develop

1. Hacer un pequeño cambio en develop:
```bash
git checkout develop
echo "# Jenkins test" >> README.md
git add README.md
git commit -m "test: Jenkins pipeline integration"
git push origin develop
```

2. Verificar que Jenkins ejecuta automáticamente el pipeline

### Test 3: Validar logs del pipeline

1. Ir a `DronCakes-CI-CD` → `develop` → última build
2. Verificar que todas las etapas se ejecutan:
   - ✅ Branch Configuration & Checkout
   - ✅ Environment Setup  
   - ✅ Dependencies Installation
   - ✅ Code Quality - ESLint
   - ✅ Security Audit
   - ✅ Unit Tests
   - ✅ Integration Tests
   - ✅ Build Application
   - ✅ E2E Tests
   - ✅ Deploy to Development

---

## 📊 Configuración de Reportes

### HTML Publisher para Reportes de Cobertura

En la configuración del pipeline, agregar Post-build Actions:
```
HTML Publisher:
- HTML directory to archive: coverage/lcov-report
- Index page: index.html
- Report title: Code Coverage Report
```

### JUnit para Resultados de Tests
```
Publish JUnit test result report:
- Test report XMLs: coverage/junit.xml
```

---

## 🔧 Troubleshooting

### Problema: "Permission denied" en scripts

**Solución**: En Windows, asegúrate de que Jenkins tenga permisos:
```bash
# En PowerShell como administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

### Problema: Node.js no encontrado

**Solución**: 
1. Verificar configuración en `Global Tool Configuration`
2. En el Jenkinsfile, asegurar que usa el NodeJS correcto:
```groovy
tools {
    nodejs "Node18"
}
```

### Problema: Tests fallan por timeouts

**Solución**: Aumentar timeout en package.json:
```json
{
  "jest": {
    "testTimeout": 30000
  }
}
```

### Problema: Puerto 3000 ocupado

**Solución**: El pipeline maneja esto automáticamente, pero puedes verificar:
```bash
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

---

## 🎯 Próximos Pasos Después de la Configuración

### 1. Configurar SonarQube (Opcional)
```bash
# Descargar SonarQube Community
# Ejecutar en http://localhost:9000
# Configurar proyecto DronCakes
```

### 2. Configurar Notificaciones

#### Slack/Teams Integration:
- Instalar Slack Notification Plugin
- Configurar webhook en Slack
- Agregar notificaciones en Jenkinsfile

#### Email Notifications:
```groovy
post {
    failure {
        emailext (
            subject: "Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
            body: "Build failed. Check console output at ${env.BUILD_URL}",
            to: "team@company.com"
        )
    }
}
```

### 3. Configurar Deployment Real

#### Para AWS:
- Instalar AWS CLI Plugin
- Configurar credenciales AWS
- Modificar deploy stages en Jenkinsfile

#### Para Docker:
- Instalar Docker Pipeline Plugin
- Crear Dockerfile
- Configurar registry (DockerHub, ECR, etc.)

---

## ✅ Checklist de Validación Final

Después de configurar todo, verifica:

- [ ] Jenkins ejecuta pipeline automáticamente en push
- [ ] Todas las etapas del pipeline pasan
- [ ] Tests unitarios e integración funcionan
- [ ] Reportes de coverage se generan
- [ ] Notificaciones funcionan (si configuradas)
- [ ] Deploy a diferentes ambientes según rama
- [ ] Logs del pipeline son claros y detallados

---

## 📞 Comandos Útiles para Debugging

### Ver logs en tiempo real:
```bash
# En Jenkins CLI
java -jar jenkins-cli.jar -s http://localhost:8080 console DronCakes-CI-CD/develop/lastBuild
```

### Limpiar workspace:
```bash
# En Jenkins UI: Build → Workspace → Wipe out current workspace
```

### Verificar configuración del pipeline:
```bash
# Validar sintaxis del Jenkinsfile
curl -X POST -F "jenkinsfile=<Jenkinsfile" http://localhost:8080/pipeline-model-converter/validate
```

---

## 🎉 ¡Configuración Completa!

Una vez completados estos pasos, tendrás:

✅ **Pipeline Multi-branch automático**  
✅ **Testing completo (Unit + Integration + E2E)**  
✅ **Code Quality con ESLint**  
✅ **Security Audit automático**  
✅ **Deployment por ambiente**  
✅ **Reportes de coverage y calidad**  
✅ **Notificaciones de build status**  

Tu pipeline CI/CD estará completamente operativo y listo para desarrollo profesional! 🚀