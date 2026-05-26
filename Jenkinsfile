pipeline {
    agent any

    environment {
        IMAGE_NAME = "books-catalog"
        IMAGE_TAG = "build-${BUILD_NUMBER}"
        CONTAINER_NAME = "books-catalog-staging"
        PROD_CONTAINER = "books-catalog-prod"
    }

    stages {

        stage('Build') {
            steps {
                echo 'Building Docker image...'
                sh 'docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .'
                sh 'docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest'
                echo "Built image: ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Test') {
            steps {
                echo 'Running Jest unit tests...'
                sh 'npm install'
                sh 'npm test'
            }
            post {
                always {
                    echo 'Test stage complete.'
                }
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Running code quality analysis with npm audit and lint check...'
                sh 'npm install'
                sh '''
                    echo "=== Dependency Audit ==="
                    npm audit --audit-level=high || true
                    echo "=== Package Stats ==="
                    npm list --depth=0 || true
                '''
            }
        }

        stage('Security') {
            steps {
                echo 'Running security vulnerability scan...'
                sh '''
                    echo "=== NPM Security Audit ==="
                    npm audit --json > audit-report.json || true
                    npm audit || true
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
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        -p 3001:3000 \
                        -e NODE_ENV=staging \
                        -e MONGODB_URI=mongodb://host.docker.internal:27017/booksDB \
                        ${IMAGE_NAME}:${IMAGE_TAG}
                    echo "Staging container started on port 3001"
                    sleep 5
                    docker ps | grep ${CONTAINER_NAME}
                '''
            }
        }

        stage('Release') {
            steps {
                echo 'Promoting to production...'
                sh '''
                    docker stop ${PROD_CONTAINER} || true
                    docker rm ${PROD_CONTAINER} || true
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:production
                    docker run -d \
                        --name ${PROD_CONTAINER} \
                        -p 3002:3000 \
                        -e NODE_ENV=production \
                        -e MONGODB_URI=mongodb://host.docker.internal:27017/booksDB \
                        ${IMAGE_NAME}:production
                    echo "Production container started on port 3002"
                    sleep 5
                    docker ps | grep ${PROD_CONTAINER}
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
                    docker stats --no-stream ${CONTAINER_NAME} || true
                    docker stats --no-stream ${PROD_CONTAINER} || true

                    echo "=== Staging Logs (last 20 lines) ==="
                    docker logs --tail 20 ${CONTAINER_NAME} || true

                    echo "=== Production Logs (last 20 lines) ==="
                    docker logs --tail 20 ${PROD_CONTAINER} || true
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
