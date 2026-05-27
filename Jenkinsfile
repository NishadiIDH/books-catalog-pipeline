pipeline {
    agent any

    environment {
        IMAGE_NAME = "books-catalog"
        IMAGE_TAG = "build-${BUILD_NUMBER}"
        CONTAINER_NAME = "books-catalog-staging"
        PROD_CONTAINER = "books-catalog-prod"
        DOCKER = "/usr/local/bin/docker"
        NPM = "/usr/local/bin/npm"
        NODE = "/usr/local/bin/node"
    }

    stages {

        stage('Build') {
            steps {
                echo 'Building Docker image...'
                sh '${DOCKER} build -t ${IMAGE_NAME}:${IMAGE_TAG} .'
                sh '${DOCKER} tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest'
                echo "Built image: ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Test') {
            steps {
                echo 'Running Jest unit tests...'
                sh '${NPM} install'
                sh '${NPM} test'
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Running code quality analysis...'
                sh '''
                    echo "=== Dependency Audit ==="
                    ${NPM} audit --audit-level=high || true
                    echo "=== Package Stats ==="
                    ${NPM} list --depth=0 || true
                '''
            }
        }

        stage('Security') {
            steps {
                echo 'Running security vulnerability scan...'
                sh '''
                    echo "=== NPM Security Audit ==="
                    ${NPM} audit --json > audit-report.json || true
                    ${NPM} audit || true
                    echo "=== Checking for known vulnerabilities ==="
                    cat audit-report.json | grep -o '"severity":"[^"]*"' | sort | uniq -c || true
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'audit-report.json', allowEmptyArchive: true
                }
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying to staging environment...'
                sh '''
                    ${DOCKER} stop ${CONTAINER_NAME} || true
                    ${DOCKER} rm ${CONTAINER_NAME} || true
                    ${DOCKER} run -d \
                        --name ${CONTAINER_NAME} \
                        -p 3001:3000 \
                        -e NODE_ENV=staging \
                        -e MONGODB_URI=mongodb://host.docker.internal:27017/booksDB \
                        ${IMAGE_NAME}:${IMAGE_TAG}
                    echo "Staging container started on port 3001"
                    sleep 5
                    ${DOCKER} ps | grep ${CONTAINER_NAME}
                '''
            }
        }

        stage('Release') {
            steps {
                echo 'Promoting to production...'
                sh '''
                    ${DOCKER} stop ${PROD_CONTAINER} || true
                    ${DOCKER} rm ${PROD_CONTAINER} || true
                    ${DOCKER} tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:production
                    ${DOCKER} run -d \
                        --name ${PROD_CONTAINER} \
                        -p 3002:3000 \
                        -e NODE_ENV=production \
                        -e MONGODB_URI=mongodb://host.docker.internal:27017/booksDB \
                        ${IMAGE_NAME}:production
                    echo "Production container started on port 3002"
                    sleep 5
                    ${DOCKER} ps | grep ${PROD_CONTAINER}
                '''
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Running monitoring checks...'
                sh '''
                    echo "=== Staging Health Check ==="
                    sleep 3
                    curl -f http://localhost:3001/ || echo "Staging health check failed"

                    echo "=== Production Health Check ==="
                    curl -f http://localhost:3002/ || echo "Production health check failed"

                    echo "=== Container Resource Usage ==="
                    ${DOCKER} stats --no-stream ${CONTAINER_NAME} || true
                    ${DOCKER} stats --no-stream ${PROD_CONTAINER} || true

                    echo "=== Staging Logs (last 20 lines) ==="
                    ${DOCKER} logs --tail 20 ${CONTAINER_NAME} || true

                    echo "=== Production Logs (last 20 lines) ==="
                    ${DOCKER} logs --tail 20 ${PROD_CONTAINER} || true
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
            echo 'Staging: http://localhost:3001'
            echo 'Production: http://localhost:3002'
        }
        failure {
            echo '❌ Pipeline failed! Check the logs above.'
        }
        always {
            echo 'Pipeline finished.'
        }
    }
}
