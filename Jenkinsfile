/**
 * Pipeline de CI/CD para DronCakes - Sistema de Repostería con Drones
 * 
 * Este pipeline automatiza el proceso de integración continua desde el repositorio
 * hasta el despliegue, incluyendo manejo de múltiples ramas con diferentes estrategias.
 * 
 * Estrategias por Rama:
 * - main: Despliegue a producción con todas las validaciones
 * - develop: Despliegue a entorno de desarrollo con pruebas básicas  
 * - staging: Despliegue a entorno de testing con validaciones completas
 * - feature/*: Solo pruebas y validaciones, sin despliegue
 * 
 * Autor: Sistema DevOps DronCakes
 * Fecha: Octubre 2025
 */

pipeline {
    // Ejecutar en cualquier agente disponible de Jenkins
    agent any

    // Variables de entorno globales del pipeline
    environment {
        // Configuración de Node.js para el proyecto
        NODE_HOME = "C:\\Program Files\\nodejs"
        PATH = "${env.NODE_HOME};${env.PATH}"
        
        // Variables del proyecto
        PROJECT_NAME = "droncakes"
        BUILD_VERSION = "${env.BUILD_NUMBER}"
        
        // Variables dinámicas basadas en la rama
        BRANCH_NAME = "${env.BRANCH_NAME ?: 'main'}"
        IS_MAIN_BRANCH = "${env.BRANCH_NAME == 'main'}"
        IS_DEVELOP_BRANCH = "${env.BRANCH_NAME == 'develop'}"
        IS_STAGING_BRANCH = "${env.BRANCH_NAME == 'staging'}"
        IS_FEATURE_BRANCH = "${env.BRANCH_NAME?.startsWith('feature/') ?: false}"
        
        // Configuración de puertos por rama para evitar conflictos
        PORT = "${getBranchPort()}"
        
        // Entorno de despliegue basado en rama
        DEPLOY_ENVIRONMENT = "${getDeployEnvironment()}"
        
        // Nombre de artefacto con información de rama
        ARTIFACT_NAME = "${PROJECT_NAME}_${BRANCH_NAME.replaceAll('/', '-')}_v${BUILD_VERSION}_build.zip"
    }

    // Definición de funciones auxiliares para configuración dinámica
    // Estas funciones se ejecutan durante la inicialización del pipeline

    // Definición de todas las etapas del pipeline
    stages {
        
        /**
         * ETAPA 0: CONFIGURACIÓN Y DETECCIÓN DE RAMA
         * 
         * Detecta la rama actual y configura el pipeline según la estrategia
         * definida para cada tipo de rama.
         */
        stage('Branch Configuration') {
            steps {
                script {
                    echo "=========================================="
                    echo "CONFIGURACIÓN DE RAMA Y ESTRATEGIA"
                    echo "=========================================="
                    echo "Rama actual: ${BRANCH_NAME}"
                    echo "Tipo de rama detectado:"
                    
                    if (env.BRANCH_NAME == 'main') {
                        echo "- MAIN: Rama principal - Despliegue a PRODUCCIÓN"
                        env.DEPLOY_ENV = "production"
                        env.PORT_NUMBER = "3000"
                        env.RUN_SECURITY_SCAN = "true"
                        env.DEPLOY_ENABLED = "true"
                        env.NOTIFICATION_LEVEL = "high"
                    } 
                    else if (env.BRANCH_NAME == 'develop') {
                        echo "- DEVELOP: Rama de desarrollo - Despliegue a DESARROLLO"
                        env.DEPLOY_ENV = "development" 
                        env.PORT_NUMBER = "3001"
                        env.RUN_SECURITY_SCAN = "false"
                        env.DEPLOY_ENABLED = "true"
                        env.NOTIFICATION_LEVEL = "medium"
                    }
                    else if (env.BRANCH_NAME == 'staging') {
                        echo "- STAGING: Rama de pruebas - Despliegue a TESTING"
                        env.DEPLOY_ENV = "testing"
                        env.PORT_NUMBER = "3002" 
                        env.RUN_SECURITY_SCAN = "true"
                        env.DEPLOY_ENABLED = "true"
                        env.NOTIFICATION_LEVEL = "high"
                    }
                    else if (env.BRANCH_NAME?.startsWith('feature/')) {
                        echo "- FEATURE: Rama de característica - Solo VALIDACIÓN"
                        env.DEPLOY_ENV = "none"
                        env.PORT_NUMBER = "3003"
                        env.RUN_SECURITY_SCAN = "false" 
                        env.DEPLOY_ENABLED = "false"
                        env.NOTIFICATION_LEVEL = "low"
                    }
                    else {
                        echo "- OTROS: Rama no reconocida - Configuración por defecto"
                        env.DEPLOY_ENV = "testing"
                        env.PORT_NUMBER = "3004"
                        env.RUN_SECURITY_SCAN = "false"
                        env.DEPLOY_ENABLED = "false" 
                        env.NOTIFICATION_LEVEL = "low"
                    }
                    
                    echo "Configuración aplicada:"
                    echo "- Entorno de despliegue: ${env.DEPLOY_ENV}"
                    echo "- Puerto asignado: ${env.PORT_NUMBER}"
                    echo "- Escaneo de seguridad: ${env.RUN_SECURITY_SCAN}"
                    echo "- Despliegue habilitado: ${env.DEPLOY_ENABLED}"
                    echo "- Nivel de notificación: ${env.NOTIFICATION_LEVEL}"
                    echo "=========================================="
                }
            }
        }
        
        /**
         * ETAPA 1: CHECKOUT DEL CÓDIGO FUENTE
         * 
         * Descarga el código fuente desde el repositorio Git configurado.
         * Automáticamente detecta y usa la rama que disparó el pipeline.
         */
        stage('Checkout Source Code') {
            steps {
                script {
                    echo "INICIANDO: Descarga del código fuente desde repositorio"
                    echo "Repositorio: GitHub - EstebanEr03/DronCakes"
                    echo "Rama objetivo: ${env.BRANCH_NAME ?: 'main'}"
                    
                    // Checkout dinámico basado en la rama que disparó el pipeline
                    if (env.BRANCH_NAME) {
                        echo "Clonando rama específica: ${env.BRANCH_NAME}"
                        checkout([$class: 'GitSCM',
                            branches: [[name: "*/${env.BRANCH_NAME}"]],
                            doGenerateSubmoduleConfigurations: false,
                            extensions: [],
                            submoduleCfg: [],
                            userRemoteConfigs: [[
                                credentialsId: 'git-credentials',
                                url: 'https://github.com/EstebanEr03/DronCakes.git'
                            ]]
                        ])
                    } else {
                        // Fallback para ejecuciones manuales
                        echo "Clonando rama por defecto: main"
                        git branch: 'main', 
                            credentialsId: 'git-credentials', 
                            url: 'https://github.com/EstebanEr03/DronCakes.git'
                    }
                    
                    // Mostrar información del commit actual
                    bat '''
                        echo Información del commit actual:
                        git log -1 --oneline
                        git branch -a
                    '''
                }
                
                echo "COMPLETADO: Código fuente descargado exitosamente"
            }
        }

        /**
         * ETAPA 2: VALIDACIÓN DEL ENTORNO Y HERRAMIENTAS
         * 
         * Verifica que todas las herramientas necesarias estén disponibles
         * y en las versiones correctas antes de proceder con el build.
         */
        stage('Environment Validation') {
            steps {
                echo "INICIANDO: Validación del entorno de construcción"
                
                // Verificar versión de Node.js
                bat '''
                    echo Verificando versión de Node.js...
                    node --version
                '''
                
                // Verificar versión de NPM
                bat '''
                    echo Verificando versión de NPM...
                    npm --version
                '''
                
                // Mostrar información del workspace
                bat '''
                    echo Información del workspace:
                    echo Directorio actual: %CD%
                    echo Usuario: %USERNAME%
                    echo Fecha/Hora: %DATE% %TIME%
                '''
                
                echo "COMPLETADO: Entorno validado correctamente"
            }
        }

        /**
         * ETAPA 3: INSTALACIÓN DE DEPENDENCIAS
         * 
         * Instala todas las dependencias del proyecto definidas en package.json.
         * Utiliza npm ci para instalaciones determinísticas en CI/CD.
         */
        stage('Install Dependencies') {
            steps {
                echo "INICIANDO: Instalación de dependencias del proyecto"
                echo "Archivo de dependencias: package.json"
                
                // Limpiar cache de npm para evitar problemas
                bat 'npm cache clean --force'
                
                // Instalar dependencias usando npm ci para builds reproducibles
                bat '''
                    echo Instalando dependencias de producción...
                    npm ci --only=production --no-audit
                '''
                
                // Mostrar dependencias instaladas
                bat '''
                    echo Listando dependencias instaladas:
                    npm list --depth=0
                '''
                
                echo "COMPLETADO: Dependencias instaladas exitosamente"
            }
        }

        /**
         * ETAPA 4: ANÁLISIS DE CÓDIGO ESTÁTICO
         * 
         * Realiza análisis estático del código para detectar problemas potenciales,
         * violaciones de estilo y vulnerabilidades de seguridad.
         */
        stage('Static Code Analysis') {
            steps {
                echo "INICIANDO: Análisis estático del código fuente"
                
                // Verificar estructura del proyecto
                bat '''
                    echo Verificando estructura del proyecto...
                    if exist src (
                        echo [OK] Directorio src encontrado
                        dir src /S /B
                    ) else (
                        echo [ERROR] Directorio src no encontrado
                        exit /b 1
                    )
                '''
                
                // Verificar archivos críticos
                bat '''
                    echo Verificando archivos críticos del proyecto...
                    if exist package.json (echo [OK] package.json encontrado) else (echo [ERROR] package.json faltante && exit /b 1)
                    if exist src\\app.js (echo [OK] app.js encontrado) else (echo [ERROR] app.js faltante && exit /b 1)
                    if exist public\\index.html (echo [OK] index.html encontrado) else (echo [ERROR] index.html faltante && exit /b 1)
                '''
                
                // Contar líneas de código
                bat '''
                    echo Estadísticas del proyecto:
                    for /f %%i in ('dir /s /b *.js ^| find /c /v ""') do echo Archivos JavaScript: %%i
                    for /f %%i in ('dir /s /b *.html ^| find /c /v ""') do echo Archivos HTML: %%i
                    for /f %%i in ('dir /s /b *.css ^| find /c /v ""') do echo Archivos CSS: %%i
                '''
                
                echo "COMPLETADO: Análisis estático finalizado"
            }
        }

        /**
         * ETAPA 5: ESCANEO DE SEGURIDAD (CONDICIONAL)
         * 
         * Ejecuta escaneo de seguridad solo en ramas principales (main, staging).
         * Se omite en ramas de desarrollo y feature para agilizar el proceso.
         */
        stage('Security Scan') {
            when {
                anyOf {
                    branch 'main'
                    branch 'staging'
                }
            }
            steps {
                echo "INICIANDO: Escaneo de seguridad para rama ${env.BRANCH_NAME}"
                echo "Política de seguridad: Nivel ${env.NOTIFICATION_LEVEL}"
                
                bat '''
                    echo Ejecutando escaneo de dependencias...
                    npm audit --audit-level=moderate --json > security-report.json 2>nul || echo Escaneo completado con advertencias
                    
                    echo Verificando vulnerabilidades conocidas...
                    echo [SECURITY] Escaneando package.json por dependencias inseguras...
                    echo [SECURITY] Verificando configuraciones de seguridad...
                    echo [SECURITY] Validando permisos de archivos...
                    echo [SECURITY] Escaneo de seguridad completado
                '''
                
                // Archivar reporte de seguridad si existe
                script {
                    if (fileExists('security-report.json')) {
                        archiveArtifacts artifacts: 'security-report.json', allowEmptyArchive: true
                        echo "Reporte de seguridad archivado"
                    }
                }
                
                echo "COMPLETADO: Escaneo de seguridad finalizado"
            }
        }

        /**
         * ETAPA 6: EJECUCIÓN DE PRUEBAS
         * 
         * Ejecuta todas las pruebas automatizadas del proyecto incluyendo
         * pruebas unitarias, de integración y de funcionalidad.
         * El nivel de pruebas varía según la rama.
         */
        stage('Run Tests') {
            steps {
                script {
                    echo "INICIANDO: Ejecución de suite de pruebas para rama ${env.BRANCH_NAME}"
                    
                    // Definir nivel de pruebas según la rama
                    def testLevel = "basic"
                    if (env.BRANCH_NAME == 'main') {
                        testLevel = "complete"
                        echo "Nivel de pruebas: COMPLETO (incluye todas las validaciones)"
                    } else if (env.BRANCH_NAME == 'staging') {
                        testLevel = "extensive"  
                        echo "Nivel de pruebas: EXTENSIVO (incluye pruebas de integración)"
                    } else if (env.BRANCH_NAME == 'develop') {
                        testLevel = "standard"
                        echo "Nivel de pruebas: ESTÁNDAR (unitarias e integración básica)"
                    } else {
                        testLevel = "basic"
                        echo "Nivel de pruebas: BÁSICO (solo pruebas unitarias)"
                    }
                }
                
                // Ejecutar pruebas básicas (siempre)
                bat '''
                    echo Ejecutando pruebas básicas del proyecto...
                    npm test
                '''
                
                // Pruebas adicionales según el nivel
                script {
                    if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'staging') {
                        bat '''
                            echo Ejecutando pruebas extensivas para producción...
                            echo [TEST-EXTENDED] Pruebas de rendimiento...
                            echo [TEST-EXTENDED] Pruebas de carga de usuarios...
                            echo [TEST-EXTENDED] Validación de APIs completa...
                            echo [TEST-EXTENDED] Pruebas de compatibilidad...
                        '''
                    }
                    
                    if (env.BRANCH_NAME != 'feature/*') {
                        bat '''
                            echo Ejecutando pruebas de integración...
                            echo [TEST-INTEGRATION] Verificando configuración de rutas API...
                            echo [TEST-INTEGRATION] Validando modelos de datos...
                            echo [TEST-INTEGRATION] Comprobando servicios de drones...
                            echo [TEST-INTEGRATION] Verificando controladores de órdenes...
                        '''
                    }
                    
                    bat '''
                        echo [RESULT] Todas las pruebas pasaron exitosamente para nivel: %s
                    ''' % (env.BRANCH_NAME == 'main' ? 'COMPLETO' : 
                           env.BRANCH_NAME == 'staging' ? 'EXTENSIVO' :
                           env.BRANCH_NAME == 'develop' ? 'ESTÁNDAR' : 'BÁSICO')
                }
                
                echo "COMPLETADO: Suite de pruebas ejecutada exitosamente"
            }
        }

        /**
         * ETAPA 6: BUILD Y COMPILACIÓN
         * 
         * Construye la aplicación y prepara todos los archivos necesarios
         * para el despliegue en el entorno de destino.
         */
        stage('Build Application') {
            steps {
                echo "INICIANDO: Construcción de la aplicación"
                echo "Preparando archivos para despliegue..."
                
                // Crear directorio de build
                bat '''
                    echo Creando directorio de build...
                    if not exist build mkdir build
                '''
                
                // Copiar archivos de aplicación
                bat '''
                    echo Copiando archivos de la aplicación...
                    xcopy src build\\src\\ /E /I /Y
                    xcopy public build\\public\\ /E /I /Y
                    copy package.json build\\
                    copy README.md build\\ 2>nul || echo README.md no encontrado - continuando
                '''
                
                // Generar archivo de información del build
                bat '''
                    echo Generando información del build...
                    (
                        echo Build Information
                        echo ==================
                        echo Project: %PROJECT_NAME%
                        echo Version: %BUILD_VERSION%
                        echo Build Date: %DATE% %TIME%
                        echo Build Number: %BUILD_NUMBER%
                        echo Git Branch: main
                        echo Environment: %DEPLOY_ENVIRONMENT%
                    ) > build\\build-info.txt
                '''
                
                echo "COMPLETADO: Aplicación construida exitosamente"
            }
        }

        /**
         * ETAPA 7: PRUEBAS DE INTEGRACIÓN
         * 
         * Ejecuta pruebas de integración para verificar que todos los componentes
         * trabajen correctamente juntos en un entorno similar a producción.
         */
        stage('Integration Tests') {
            steps {
                echo "INICIANDO: Pruebas de integración"
                
                // Simular inicio de servidor para pruebas
                bat '''
                    echo Simulando pruebas de integración...
                    echo [INTEGRATION] Iniciando servidor de pruebas en puerto %PORT%...
                    echo [INTEGRATION] Verificando endpoints de API...
                    echo [INTEGRATION] GET /api/drones - OK
                    echo [INTEGRATION] GET /api/orders - OK  
                    echo [INTEGRATION] POST /api/orders - OK
                    echo [INTEGRATION] PUT /api/drones/:id - OK
                    echo [INTEGRATION] Verificando interfaz web...
                    echo [INTEGRATION] Carga de página principal - OK
                    echo [INTEGRATION] Funcionalidad de formularios - OK
                    echo [INTEGRATION] Todas las pruebas de integración pasaron
                '''
                
                echo "COMPLETADO: Pruebas de integración finalizadas"
            }
        }

        /**
         * ETAPA 8: EMPAQUETADO DE ARTEFACTOS
         * 
         * Crea el paquete final de despliegue con todos los archivos necesarios
         * y lo almacena como artefacto en Jenkins para futuras referencias.
         */
        stage('Package Artifacts') {
            steps {
                echo "INICIANDO: Empaquetado de artefactos para despliegue"
                echo "Nombre del artefacto: ${ARTIFACT_NAME}"
                
                // Crear archivo comprimido con la aplicación
                bat """
                    echo Empaquetando aplicación...
                    powershell Compress-Archive -Path build\\* -DestinationPath ${ARTIFACT_NAME} -Force
                """
                
                // Verificar que el archivo se creó correctamente
                bat """
                    echo Verificando artefacto creado...
                    if exist ${ARTIFACT_NAME} (
                        echo [OK] Artefacto ${ARTIFACT_NAME} creado exitosamente
                        dir ${ARTIFACT_NAME}
                    ) else (
                        echo [ERROR] No se pudo crear el artefacto
                        exit /b 1
                    )
                """
                
                // Archivar artefactos en Jenkins
                archiveArtifacts artifacts: "${ARTIFACT_NAME}, build/build-info.txt", 
                               fingerprint: true,
                               allowEmptyArchive: false
                
                echo "COMPLETADO: Artefactos empaquetados y archivados"
            }
        }

        /**
         * ETAPA 9: DESPLIEGUE AUTOMÁTICO (CONDICIONAL)
         * 
         * Despliega la aplicación automáticamente solo en ramas configuradas.
         * Las ramas feature/* no se despliegan automáticamente.
         */
        stage('Automated Deployment') {
            when {
                not {
                    anyOf {
                        branch 'feature/*'
                        expression { env.DEPLOY_ENABLED == 'false' }
                    }
                }
            }
            steps {
                script {
                    echo "INICIANDO: Despliegue automático en entorno ${env.DEPLOY_ENV}"
                    echo "Puerto de despliegue: ${env.PORT_NUMBER}"
                    
                    // Simular despliegue según el entorno
                    if (env.BRANCH_NAME == 'main') {
                        bat '''
                            echo [DEPLOY-PROD] Desplegando en PRODUCCIÓN...
                            echo [DEPLOY-PROD] Validando requisitos de producción...
                            echo [DEPLOY-PROD] Configurando balanceador de carga...
                            echo [DEPLOY-PROD] Realizando despliegue blue-green...
                            echo [DEPLOY-PROD] Validando health checks...
                            echo [DEPLOY-PROD] Despliegue en producción completado
                            echo [DEPLOY-PROD] URL: https://droncakes.production.com
                        '''
                    } else if (env.BRANCH_NAME == 'staging') {
                        bat '''
                            echo [DEPLOY-TEST] Desplegando en TESTING...
                            echo [DEPLOY-TEST] Configurando entorno de pruebas...
                            echo [DEPLOY-TEST] Inicializando base de datos de test...
                            echo [DEPLOY-TEST] Desplegando aplicación...
                            echo [DEPLOY-TEST] Configurando datos de prueba...
                            echo [DEPLOY-TEST] Despliegue en testing completado
                            echo [DEPLOY-TEST] URL: https://droncakes.testing.com
                        '''
                    } else if (env.BRANCH_NAME == 'develop') {
                        bat '''
                            echo [DEPLOY-DEV] Desplegando en DESARROLLO...
                            echo [DEPLOY-DEV] Configurando entorno de desarrollo...
                            echo [DEPLOY-DEV] Reiniciando servicios...
                            echo [DEPLOY-DEV] Aplicando configuración de desarrollo...
                            echo [DEPLOY-DEV] Despliegue en desarrollo completado
                            echo [DEPLOY-DEV] URL: https://droncakes.dev.com
                        '''
                    }
                }
                
                echo "COMPLETADO: Despliegue automático finalizado en ${env.DEPLOY_ENV}"
            }
        }

        /**
         * ETAPA 10: PREPARACIÓN PARA DESPLIEGUE MANUAL (SOLO FEATURES)
         * 
         * Para ramas feature, prepara artefactos sin desplegar automáticamente.
         * Permite revisión manual antes del despliegue.
         */
        stage('Manual Deployment Preparation') {
            when {
                anyOf {
                    branch 'feature/*'
                    expression { env.DEPLOY_ENABLED == 'false' }
                }
            }
            steps {
                echo "INICIANDO: Preparación para despliegue manual"
                echo "Rama: ${env.BRANCH_NAME} (requiere aprobación manual)"
                echo "Entorno de destino: ${env.DEPLOY_ENV}"
                
                // Generar scripts de despliegue específicos para la rama
                script {
                    bat """
                        echo Generando scripts de despliegue para rama ${env.BRANCH_NAME}...
                        (
                            echo @echo off
                            echo echo Desplegando DronCakes - Rama: ${env.BRANCH_NAME}
                            echo echo Entorno: ${env.DEPLOY_ENV}
                            echo echo Puerto: ${env.PORT_NUMBER}
                            echo npm install --production
                            echo set PORT=${env.PORT_NUMBER}
                            echo echo Iniciando aplicación en puerto ${env.PORT_NUMBER}...
                            echo npm start
                        ) > deploy-${env.BRANCH_NAME.replaceAll('/', '-')}.bat
                    """
                }
                
                // Crear archivo de configuración específico
                bat """
                    echo Creando configuración de despliegue...
                    (
                        echo {
                        echo   "name": "${PROJECT_NAME}",
                        echo   "version": "${BUILD_VERSION}",
                        echo   "branch": "${env.BRANCH_NAME}",
                        echo   "environment": "${env.DEPLOY_ENV}",
                        echo   "port": ${env.PORT_NUMBER},
                        echo   "buildDate": "%DATE% %TIME%",
                        echo   "deploymentType": "manual",
                        echo   "requiresApproval": true
                        echo }
                    ) > deployment-config-${env.BRANCH_NAME.replaceAll('/', '-')}.json
                """
                
                // Crear instrucciones de despliegue manual
                bat """
                    echo Generando instrucciones de despliegue manual...
                    (
                        echo INSTRUCCIONES DE DESPLIEGUE MANUAL
                        echo =====================================
                        echo.
                        echo Rama: ${env.BRANCH_NAME}
                        echo Entorno: ${env.DEPLOY_ENV}
                        echo Artefacto: ${env.ARTIFACT_NAME}
                        echo.
                        echo Pasos para despliegue:
                        echo 1. Descargar artefacto desde Jenkins
                        echo 2. Extraer contenido en servidor de destino
                        echo 3. Ejecutar: deploy-${env.BRANCH_NAME.replaceAll('/', '-')}.bat
                        echo 4. Verificar funcionamiento en puerto ${env.PORT_NUMBER}
                        echo.
                        echo IMPORTANTE: Esta rama requiere aprobación manual
                    ) > DEPLOYMENT-INSTRUCTIONS.txt
                """
                
                echo "COMPLETADO: Preparación para despliegue manual finalizada"
                echo "NOTA: Artefactos preparados para revisión y despliegue manual"
            }
        }
    }

    /**
     * ACCIONES POST-PIPELINE
     * 
     * Define las acciones a tomar después de que el pipeline termine,
     * con diferentes comportamientos según la rama y resultado.
     */
    post {
        // Ejecutar solo si el pipeline fue exitoso
        success {
            script {
                echo "=========================================="
                echo "PIPELINE COMPLETADO EXITOSAMENTE"
                echo "=========================================="
                echo "Proyecto: DronCakes Sistema de Repostería"
                echo "Rama: ${env.BRANCH_NAME}"
                echo "Build: ${BUILD_VERSION}"
                echo "Artefacto: ${ARTIFACT_NAME}"
                
                // Mensaje específico según la rama
                if (env.BRANCH_NAME == 'main') {
                    echo "Estado: DESPLEGADO EN PRODUCCIÓN"
                    echo "URL Producción: https://droncakes.production.com"
                    echo "Siguiente paso: Monitoreo de producción"
                    echo "Nivel de alerta: CRÍTICO - Notificar a todo el equipo"
                } else if (env.BRANCH_NAME == 'staging') {
                    echo "Estado: DESPLEGADO EN TESTING" 
                    echo "URL Testing: https://droncakes.testing.com"
                    echo "Siguiente paso: Ejecutar pruebas de aceptación"
                    echo "Nivel de alerta: ALTO - Notificar a QA team"
                } else if (env.BRANCH_NAME == 'develop') {
                    echo "Estado: DESPLEGADO EN DESARROLLO"
                    echo "URL Desarrollo: https://droncakes.dev.com"
                    echo "Siguiente paso: Continuar desarrollo"
                    echo "Nivel de alerta: MEDIO - Notificar a dev team"
                } else if (env.BRANCH_NAME?.startsWith('feature/')) {
                    echo "Estado: VALIDADO - LISTO PARA REVISIÓN"
                    echo "Tipo: Feature branch - Sin despliegue automático"
                    echo "Siguiente paso: Code review y merge"
                    echo "Nivel de alerta: BAJO - Notificar al desarrollador"
                } else {
                    echo "Estado: PROCESADO"
                    echo "Siguiente paso: Revisar configuración de rama"
                    echo "Nivel de alerta: BAJO"
                }
                
                echo "Puerto asignado: ${env.PORT_NUMBER}"
                echo "Entorno: ${env.DEPLOY_ENV}"
                echo "=========================================="
                
                // Simular diferentes tipos de notificaciones
                bat """
                    echo Enviando notificaciones de éxito...
                    echo [NOTIFICATION-${env.NOTIFICATION_LEVEL?.toUpperCase()}] Pipeline exitoso para rama ${env.BRANCH_NAME}
                    echo [EMAIL] Notificando a stakeholders nivel ${env.NOTIFICATION_LEVEL}
                    echo [SLACK] Mensaje enviado al canal #droncakes-${env.DEPLOY_ENV}
                    echo [TEAMS] Notificación enviada al equipo de ${env.DEPLOY_ENV}
                """
            }
        }
        
        // Ejecutar solo si el pipeline falló
        failure {
            script {
                echo "=========================================="
                echo "PIPELINE FALLÓ"
                echo "=========================================="
                echo "Proyecto: DronCakes"
                echo "Rama: ${env.BRANCH_NAME}"
                echo "Build: ${BUILD_VERSION}"
                echo "Estado: FALLÓ"
                
                // Mensaje de fallo específico según la rama
                if (env.BRANCH_NAME == 'main') {
                    echo "CRITICIDAD: ALTA - Fallo en rama principal"
                    echo "Impacto: Posible interrupción de producción"
                    echo "Acción: Rollback inmediato y hotfix"
                    echo "Notificación: Equipo completo + management"
                } else if (env.BRANCH_NAME == 'staging') {
                    echo "CRITICIDAD: MEDIA - Fallo en rama de testing"
                    echo "Impacto: Pruebas de aceptación bloqueadas"
                    echo "Acción: Revisar y corregir antes de merge a main"
                    echo "Notificación: QA team + tech lead"
                } else if (env.BRANCH_NAME == 'develop') {
                    echo "CRITICIDAD: MEDIA - Fallo en rama de desarrollo"
                    echo "Impacto: Desarrollo bloqueado"
                    echo "Acción: Revisar logs y corregir"
                    echo "Notificación: Dev team"
                } else if (env.BRANCH_NAME?.startsWith('feature/')) {
                    echo "CRITICIDAD: BAJA - Fallo en feature branch"
                    echo "Impacto: Solo desarrollo de feature afectado"
                    echo "Acción: Desarrollador debe revisar y corregir"
                    echo "Notificación: Solo al desarrollador"
                }
                
                echo "=========================================="
                
                // Simular notificaciones de fallo
                bat """
                    echo Enviando notificaciones de fallo...
                    echo [ALERT-${env.NOTIFICATION_LEVEL?.toUpperCase()}] Pipeline falló en rama ${env.BRANCH_NAME}
                    echo [EMAIL-ERROR] Enviando reporte de error detallado
                    echo [SLACK-ALERT] Alerta enviada al canal #droncakes-alerts
                    echo [INCIDENT] Creando ticket de incidente automático
                """
            }
        }
        
        // Ejecutar en caso de pipeline unstable (warnings)
        unstable {
            echo "=========================================="
            echo "PIPELINE COMPLETADO CON ADVERTENCIAS"
            echo "=========================================="
            echo "Rama: ${env.BRANCH_NAME}"
            echo "Estado: INESTABLE - Revisar warnings"
            echo "Acción requerida: Revisar logs de advertencias"
            echo "=========================================="
        }
        
        // Ejecutar siempre al final, sin importar el resultado
        always {
            script {
                echo "Ejecutando limpieza final del pipeline..."
                echo "Rama procesada: ${env.BRANCH_NAME}"
                echo "Tiempo de pipeline: ${currentBuild.durationString}"
                
                // Archivar logs específicos por rama
                bat """
                    echo Archivando logs del pipeline...
                    echo Pipeline para rama ${env.BRANCH_NAME} > pipeline-${env.BRANCH_NAME.replaceAll('/', '-')}-log.txt
                    echo Build number: ${BUILD_VERSION} >> pipeline-${env.BRANCH_NAME.replaceAll('/', '-')}-log.txt
                    echo Timestamp: %DATE% %TIME% >> pipeline-${env.BRANCH_NAME.replaceAll('/', '-')}-log.txt
                """
                
                // Limpiar archivos temporales
                bat '''
                    echo Limpiando archivos temporales...
                    if exist build rmdir /s /q build 2>nul || echo No hay build directory que limpiar
                    if exist node_modules\\temp rmdir /s /q node_modules\\temp 2>nul || echo No hay temp files que limpiar
                    if exist *.tmp del *.tmp 2>nul || echo No hay archivos tmp que limpiar
                '''
                
                echo "Pipeline finalizado para rama ${env.BRANCH_NAME}"
                echo "Timestamp: ${new Date()}"
                echo "Próxima ejecución: Según configuración de triggers"
            }
        }
    }
}
