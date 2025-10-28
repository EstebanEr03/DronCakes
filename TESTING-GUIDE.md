# 🧪 Guía de Pruebas y Validación - Pipeline CI/CD DronCakes

## 📋 Resumen de Estado Actual

✅ **Tests Locales Completados:**
- Unit Tests: 18/18 ✅ (82% coverage en servicios críticos)
- Integration Tests: 7/7 ✅
- Security Audit: 0 vulnerabilities ✅
- Code Quality: ESLint configurado ✅

## 🚀 Opciones para Validar el Pipeline

### 1. **Validación Local Completa** (Recomendado primero)

Ejecuta estos comandos para simular el pipeline completo:

```bash
# 1. Unit Tests con Coverage
npm run test:unit

# 2. Integration Tests
npx jest tests/integration/business-logic.test.js

# 3. Code Quality Check
npm run lint:check

# 4. Security Audit
npm audit

# 5. Probar la aplicación
npm start
# (En otro terminal) curl http://localhost:3000/api
```

### 2. **Validación con Git/GitHub** (Siguiente paso)

Para probar el pipeline real con Jenkins, necesitas:

#### A. Configurar el repositorio Git:

```bash
# Inicializar Git (si no está hecho)
git init
git add .
git commit -m "Initial CI/CD implementation"

# Agregar remote a tu repositorio GitHub
git remote add origin https://github.com/TU_USUARIO/jenkins-ci-demo.git

# Push inicial a main
git push -u origin main
```

#### B. Crear ramas para probar diferentes estrategias:

```bash
# Crear y probar rama develop
git checkout -b develop
git push -u origin develop

# Crear y probar rama staging  
git checkout -b staging
git push -u origin staging

# Crear y probar feature branch
git checkout -b feature/test-pipeline
echo "# Test change" >> README.md
git add README.md
git commit -m "Test feature change"
git push -u origin feature/test-pipeline
```

### 3. **Configuración de Jenkins** (Necesaria para pipeline completo)

Para que el Jenkinsfile funcione completamente, necesitas configurar:

#### Credenciales en Jenkins:
```
- deploy-host: Credencial para servidor de deploy
- github-token: Token de GitHub para notificaciones  
- sonar-token: Token de SonarQube (opcional)
```

#### Plugins de Jenkins necesarios:
```
- Pipeline Plugin
- Git Plugin  
- NodeJS Plugin
- HTML Publisher Plugin
- JUnit Plugin
- SonarQube Scanner (opcional)
```

## 🔧 Pruebas Paso a Paso

### Test 1: Pipeline de Feature Branch

```bash
git checkout -b feature/pipeline-test
echo "console.log('Pipeline test');" >> src/test-file.js
git add .
git commit -m "Add pipeline test file"
git push -u origin feature/pipeline-test
```

**Resultado esperado:** 
- ✅ Unit Tests
- ✅ Integration Tests  
- ✅ Code Quality Check
- ✅ Security Audit
- ❌ NO Deploy (feature branches no se despliegan)

### Test 2: Pipeline de Develop Branch

```bash
git checkout develop
git merge feature/pipeline-test
git push origin develop
```

**Resultado esperado:**
- ✅ Todas las validaciones
- ✅ Deploy a Development Environment
- ✅ E2E Tests

### Test 3: Pipeline de Staging Branch

```bash
git checkout staging
git merge develop
git push origin staging
```

**Resultado esperado:**
- ✅ Todas las validaciones + Quality Gate
- ✅ SonarQube Analysis
- ✅ Deploy a Staging Environment
- ✅ E2E Tests completos

### Test 4: Pipeline de Main/Production

```bash
git checkout main
git merge staging
git push origin main
```

**Resultado esperado:**
- ✅ Validaciones completas
- ⏸️ Manual Approval Required
- ✅ Deploy a Production (después de aprobación)
- ✅ Post-deploy Health Checks

## 📊 Validación de Resultados

### Métricas a Verificar:

1. **Test Coverage:** Debe mantener >80% en servicios
2. **Code Quality:** Sin errores críticos de ESLint
3. **Security:** 0 vulnerabilities 
4. **Performance:** Tests completan en <5 minutos
5. **Deploy Success:** Aplicación accesible después del deploy

### Logs a Revisar:

```bash
# Ver logs de tests
cat coverage/lcov-report/index.html

# Ver logs de calidad
cat eslint-report.json

# Ver logs de aplicación  
npm start # En segundo plano
curl http://localhost:3000/api
```

## 🛠️ Comandos de Troubleshooting

### Si fallan los tests:
```bash
# Ejecutar tests con debug
npm run test:unit -- --verbose

# Ejecutar integration tests individualmente
npx jest tests/integration/business-logic.test.js --verbose
```

### Si falla la aplicación:
```bash
# Verificar dependencias
npm install

# Verificar puerto
netstat -ano | findstr :3000

# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Si falla ESLint:
```bash
# Ver todos los errores
npm run lint:check

# Auto-fix algunos errores
npm run lint:fix
```

## 🎯 Próximos Pasos Recomendados

### 1. **Setup Inmediato** (Hoy):
- [ ] Ejecutar validación local completa
- [ ] Configurar repositorio Git
- [ ] Push a GitHub

### 2. **Setup de Jenkins** (Esta semana):
- [ ] Instalar Jenkins localmente o usar Jenkins online
- [ ] Configurar credenciales
- [ ] Importar proyecto desde GitHub
- [ ] Ejecutar primer pipeline

### 3. **Mejoras Futuras** (Siguiente iteración):
- [ ] Configurar SonarQube
- [ ] Agregar más E2E tests
- [ ] Implementar notificaciones Slack/Teams
- [ ] Configurar métricas de performance

## 📞 Validación Rápida de 5 Minutos

Si quieres una validación rápida ahora mismo:

```bash
# 1. Tests básicos (2 min)
npm run test:unit

# 2. Integration tests (30 seg)  
npx jest tests/integration/business-logic.test.js

# 3. Aplicación funcionando (1 min)
npm start &
sleep 5
curl http://localhost:3000/api

# 4. Limpiar
pkill -f "node.*app.js"
```

**Resultado esperado:** Todos los comandos deben ejecutarse sin errores y la aplicación debe responder en el puerto 3000.

---

## ✅ Checklist de Validación Completa

- [ ] Unit Tests: 18 tests passing
- [ ] Integration Tests: 7 tests passing  
- [ ] Security: 0 vulnerabilities
- [ ] Application: Starts without errors
- [ ] API: Responds on http://localhost:3000/api
- [ ] Jenkinsfile: Syntax válida para multi-branch pipeline
- [ ] Package.json: Scripts configurados correctamente
- [ ] ESLint: Configuración funcional
- [ ] Cypress: E2E tests configurados

**¿Todo marcado?** 🎉 ¡Tu pipeline CI/CD está listo para producción!