# 🌿 Estrategia de Manejo de Ramas - DronCakes CI/CD

## 📋 Resumen del Flujo de Trabajo

Este proyecto implementa una estrategia de **GitFlow modificada** con pipeline CI/CD automático que maneja diferentes tipos de ramas con distintas políticas de despliegue y validación.

## 🌳 Tipos de Ramas y Estrategias

### **🟢 MAIN (Producción)**
- **Propósito**: Código estable listo para producción
- **Despliegue**: Automático a PRODUCCIÓN (puerto 3000)
- **Pruebas**: Nivel COMPLETO (todas las validaciones)
- **Seguridad**: Escaneo completo habilitado
- **Notificaciones**: CRÍTICAS - Todo el equipo + management
- **URL**: `https://droncakes.production.com`

### **🟡 STAGING (Testing)**
- **Propósito**: Pruebas finales antes de producción
- **Despliegue**: Automático a TESTING (puerto 3002)
- **Pruebas**: Nivel EXTENSIVO (incluye integración)
- **Seguridad**: Escaneo completo habilitado
- **Notificaciones**: ALTAS - QA team + tech lead
- **URL**: `https://droncakes.testing.com`

### **🔵 DEVELOP (Desarrollo)**
- **Propósito**: Integración de nuevas características
- **Despliegue**: Automático a DESARROLLO (puerto 3001)
- **Pruebas**: Nivel ESTÁNDAR (unitarias + integración básica)
- **Seguridad**: Sin escaneo (para agilizar desarrollo)
- **Notificaciones**: MEDIAS - Dev team
- **URL**: `https://droncakes.dev.com`

### **🟣 FEATURE/* (Características)**
- **Propósito**: Desarrollo de nuevas funcionalidades
- **Despliegue**: **MANUAL** (requiere aprobación)
- **Pruebas**: Nivel BÁSICO (solo unitarias)
- **Seguridad**: Sin escaneo
- **Notificaciones**: BAJAS - Solo desarrollador
- **Puerto**: 3003 (para testing local)

## 🔄 Pipeline CI/CD por Rama

### Etapas Comunes (Todas las Ramas):
1. **Branch Configuration** - Detecta tipo de rama y configura estrategia
2. **Checkout Source Code** - Descarga código de la rama específica
3. **Environment Validation** - Valida herramientas y entorno
4. **Install Dependencies** - Instala dependencias con `npm ci`
5. **Static Code Analysis** - Análisis de código y estructura

### Etapas Condicionales:

#### **Security Scan** (Solo main y staging):
- Escaneo de vulnerabilidades con `npm audit`
- Validación de dependencias inseguras
- Generación de reportes de seguridad

#### **Run Tests** (Nivel variable por rama):
- **MAIN/STAGING**: Pruebas completas + rendimiento + carga
- **DEVELOP**: Pruebas estándar + integración
- **FEATURE**: Solo pruebas básicas unitarias

#### **Build Application** (Todas las ramas):
- Construcción de aplicación
- Generación de artefactos versionados
- Información de build con metadatos de rama

#### **Integration Tests** (Todas excepto feature):
- Validación de endpoints API
- Pruebas de interfaz web
- Verificación de componentes integrados

#### **Package Artifacts** (Todas las ramas):
- Empaquetado con nombre específico por rama
- Archivado automático en Jenkins
- Fingerprinting para trazabilidad

### Etapas de Despliegue:

#### **Automated Deployment** (main, staging, develop):
- Despliegue automático según entorno configurado
- Validaciones específicas por entorno
- Configuración de URLs y puertos únicos

#### **Manual Deployment Preparation** (feature/* y otros):
- Preparación de artefactos sin desplegar
- Generación de scripts de despliegue manual
- Instrucciones detalladas para revisión

## 🚀 Comandos Git para Trabajar con Ramas

### Crear y trabajar con feature branch:
```bash
# Crear nueva feature desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# Desarrollar y commitear cambios
git add .
git commit -m "feat: agregar nueva funcionalidad"
git push origin feature/nueva-funcionalidad

# El pipeline ejecutará validaciones básicas sin desplegar
```

### Merger feature a develop:
```bash
# Desde feature branch
git checkout develop
git pull origin develop
git merge feature/nueva-funcionalidad
git push origin develop

# El pipeline desplegará automáticamente en desarrollo
```

### Promover develop a staging:
```bash
# Cuando develop esté estable
git checkout staging
git pull origin staging
git merge develop
git push origin staging

# El pipeline ejecutará pruebas extensivas y desplegará en testing
```

### Release a producción:
```bash
# Cuando staging esté aprobado
git checkout main
git pull origin main
git merge staging
git push origin main

# El pipeline ejecutará validaciones completas y desplegará en producción
```

## 📊 Configuración de Entornos

| Rama | Puerto | Entorno | Despliegue | Pruebas | Seguridad | Notificaciones |
|------|--------|---------|------------|---------|-----------|----------------|
| main | 3000 | production | Automático | Completo | ✅ | Críticas |
| staging | 3002 | testing | Automático | Extensivo | ✅ | Altas |
| develop | 3001 | development | Automático | Estándar | ❌ | Medias |
| feature/* | 3003 | none | Manual | Básico | ❌ | Bajas |

## 🔔 Sistema de Notificaciones

### Nivel CRÍTICO (main):
- Email a todo el equipo
- Slack #droncakes-alerts
- Teams management channel
- Creación automática de incident

### Nivel ALTO (staging):
- Email a QA team + tech lead
- Slack #droncakes-testing
- Teams QA channel

### Nivel MEDIO (develop):
- Email a dev team
- Slack #droncakes-dev

### Nivel BAJO (feature):
- Email solo al desarrollador
- Sin alertas masivas

## 🛠️ Troubleshooting

### Pipeline falla en main:
1. **Rollback inmediato** del despliegue
2. **Hotfix branch** desde main
3. **Revisión urgente** del equipo completo
4. **Comunicación** a stakeholders

### Pipeline falla en staging:
1. **Bloqueo** de merge a main
2. **Revisión** de QA team
3. **Corrección** antes de retry

### Pipeline falla en develop:
1. **Revisión** de dev team
2. **Corrección** de conflictos
3. **Retry** después de fix

### Pipeline falla en feature:
1. **Responsabilidad** del desarrollador
2. **No bloquea** otras ramas
3. **Revisión individual**

## 📝 Mejores Prácticas

1. **Nunca pushear directamente a main** - Usar pull requests
2. **Mantener develop actualizado** - Pull frecuente de main
3. **Feature branches pequeñas** - Merges frecuentes
4. **Nombres descriptivos** - `feature/add-drone-tracking`
5. **Clean history** - Squash commits antes de merge
6. **Testing local** - Validar antes de push
7. **Code review** - Requerido para todas las ramas principales

## 🎯 Beneficios de Esta Estrategia

✅ **Despliegues seguros** - Validaciones por etapas  
✅ **Aislamiento de entornos** - Puertos y configuraciones únicas  
✅ **Feedback rápido** - Pruebas apropiadas por contexto  
✅ **Trazabilidad completa** - Logs y artefactos por rama  
✅ **Escalabilidad** - Fácil agregar nuevos tipos de rama  
✅ **Automatización inteligente** - Manual solo donde es necesario  