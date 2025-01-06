pipeline {
    agent any

    environment {
        VETESTX_URL = credentials('vetestx-url')
        VETESTX_TOKEN = credentials('vetestx-token')
        OPENAI_TOKEN = credentials('openai-token')
        JENKINS_TOKEN = credentials('jenkins-token')
    }

    stages {
        stage('Setup') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'node src/runTests.js'
            }
        }

        stage('Report') {
            steps {
                archiveArtifacts artifacts: 'test-results.json', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        failure {
            echo 'Test suite failed!'
        }
    }
}