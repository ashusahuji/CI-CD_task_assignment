pipeline {
    agent any
    
    environment {
        DOCKER_HUB_REPO = 'ashu30days'
        BACKEND_IMAGE = "${DOCKER_HUB_REPO}/mean-app-backend"
        FRONTEND_IMAGE = "${DOCKER_HUB_REPO}/mean-app-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                // If using Git, uncomment below:
                // checkout scm
                echo 'Using workspace files...'
            }
        }
        
        stage('Build Backend Image') {
            steps {
                echo 'Building backend Docker image...'
                dir('/workspace/backend') {
                    script {
                        sh """
                            docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} .
                            docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest
                        """
                    }
                }
            }
        }
        
        stage('Build Frontend Image') {
            steps {
                echo 'Building frontend Docker image...'
                dir('/workspace/frontend') {
                    script {
                        sh """
                            docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} .
                            docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest
                        """
                    }
                }
            }
        }
        
        stage('Test Images') {
            steps {
                echo 'Running basic image tests...'
                script {
                    sh """
                        docker images | grep ${DOCKER_HUB_REPO}
                        echo 'Backend image size:'
                        docker images ${BACKEND_IMAGE}:latest --format '{{.Size}}'
                        echo 'Frontend image size:'
                        docker images ${FRONTEND_IMAGE}:latest --format '{{.Size}}'
                    """
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo 'Pushing images to Docker Hub...'
                script {
                    withCredentials([usernamePassword(
                        credentialsId: "${DOCKER_CREDENTIALS_ID}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh """
                            echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                            docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                            docker push ${BACKEND_IMAGE}:latest
                            docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                            docker push ${FRONTEND_IMAGE}:latest
                            docker logout
                        """
                    }
                }
            }
        }
        
        stage('Deploy Application') {
            steps {
                echo 'Deploying application with Docker Compose...'
                dir('/workspace') {
                    script {
                        sh """
                            # Force remove any existing containers with these names
                            docker rm -f mongodb backend frontend nginx || true
                            
                            # Start services with latest images
                            docker compose up -d mongodb backend frontend nginx
                            
                            # Wait for services to be healthy
                            echo 'Waiting for services to start...'
                            sleep 10
                        """
                    }
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo 'Verifying deployment...'
                dir('/workspace') {
                    script {
                        sh """
                            # Check if containers are running
                            docker compose ps
                            
                            # Check nginx health
                            echo 'Checking nginx reverse proxy...'
                            curl -f http://nginx/health || echo 'Nginx health check not ready yet'
                            
                            # Check frontend through nginx
                            echo 'Checking frontend through nginx...'
                            curl -f http://nginx/ || echo 'Frontend not ready yet'
                            
                            # Check backend through nginx
                            echo 'Checking backend API through nginx...'
                            curl -f http://nginx/api || echo 'Backend API not ready yet'
                            
                            # List running containers
                            docker ps --filter 'name=backend' --filter 'name=frontend' --filter 'name=mongodb' --filter 'name=nginx'
                        """
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo "Backend: ${BACKEND_IMAGE}:${IMAGE_TAG}"
            echo "Frontend: ${FRONTEND_IMAGE}:${IMAGE_TAG}"
            echo 'Application deployed and running.'
        }
        failure {
            echo '❌ Pipeline failed! Check logs for details.'
        }
        always {
            echo 'Cleaning up...'
            sh 'docker system prune -f --volumes=false'
        }
    }
}
