pipeline {
    agent any

    environment {
        NODE_HOME = "C:\\Program Files\\nodejs"
        PATH = "${env.NODE_HOME};${env.PATH}"
    }

    stages {
        stage('Clonar Repositorio') {
            steps {
                echo '📥 Clonando código desde GitHub...'
                git branch: 'main', credentialsId: 'git-credentials', url: 'https://github.com/EstebanEr03/droncakes.git'
            }
        }

        stage('Instalar Dependencias') {
            steps {
                echo '📦 Instalando dependencias del proyecto...'
                bat 'npm install'
            }
        }

        stage('Ejecutar Tests') {
            steps {
                echo '🧪 Ejecutando pruebas automatizadas...'
                bat 'npm test'
            }
        }

        stage('Verificar Estructura') {
            steps {
                echo '📂 Revisando estructura y archivos...'
                bat 'dir src'
            }
        }

        stage('Empaquetar Resultados') {
            steps {
                echo '📦 Empaquetando artefactos...'
                bat 'zip -r droncakes_build.zip src'
                archiveArtifacts artifacts: 'droncakes_build.zip', fingerprint: true
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completado correctamente: DronCakes listo para despliegue.'
        }
        failure {
            echo '❌ Pipeline falló: revisar logs y etapas.'
        }
    }
}
