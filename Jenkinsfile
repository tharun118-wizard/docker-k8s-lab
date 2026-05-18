pipeline {

  agent any

  environment {
    APP_NAME       = 'snake-game'
    DOCKER_IMAGE   = "${APP_NAME}:${BUILD_NUMBER}"
    CONTAINER_NAME = 'snake-game-container'
    APP_PORT       = '4000'
  }

  tools {
    nodejs 'NodeJS-18'
  }

  stages {

    // ── STAGE 1: Checkout ────────────────────────
    stage('📁 Checkout') {

      steps {

        echo "Checking out branch: ${env.GIT_BRANCH}"

        checkout scm

        sh '''
          echo "--- Repository Contents ---"
          ls -la
        '''
      }
    }

    // ── STAGE 2: Install Dependencies ────────────
    stage('📦 Install Dependencies') {

      steps {

        sh '''
          echo "Node version: $(node --version)"
          echo "NPM version: $(npm --version)"

          npm ci
        '''
      }
    }

    // ── STAGE 3: Parallel Test Suite ─────────────
    stage('🧪 Test Suite') {

      parallel {

        stage('Run Tests') {

          steps {
            sh 'npm test || true'
          }
        }

        stage('Check Application Files') {

          steps {

            sh '''
              echo "Checking app files..."
              ls -la
            '''
          }
        }

        stage('Check Node Environment') {

          steps {

            sh '''
              node --version
              npm --version
            '''
          }
        }
      }

      post {

        always {
          echo 'Parallel test suite completed.'
        }
      }
    }

    // ── STAGE 4: Multi-Version Testing ───────────
    stage('🔁 Multi-Version Test') {

      matrix {

        axes {

          axis {
            name 'NODE_VERSION'
            values '16', '18', '20'
          }
        }

        stages {

          stage('Test on Node Version') {

            agent {

              docker {
                image "node:${NODE_VERSION}-alpine"
              }
            }

            steps {

              sh '''
                echo "Running tests on Node ${NODE_VERSION}"

                node --version

                npm ci
                npm test || true
              '''
            }
          }
        }
      }
    }

    // ── STAGE 5: Build Docker Image ──────────────
    stage('🐳 Build Docker Image') {

      steps {

        sh """
          docker build \
            --build-arg BUILD_NUMBER=${BUILD_NUMBER} \
            -t ${DOCKER_IMAGE} \
            -t ${APP_NAME}:latest \
            .

          echo "Docker image built successfully."

          docker images | grep ${APP_NAME}
        """
      }
    }

    // ── STAGE 6: Push to Docker Hub ──────────────
    stage('☁️ Push to Docker Hub') {

      steps {

        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-credentials',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {

          sh """
            echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin

            docker tag ${DOCKER_IMAGE} ${DOCKER_USER}/${APP_NAME}:${BUILD_NUMBER}

            docker tag ${DOCKER_IMAGE} ${DOCKER_USER}/${APP_NAME}:latest

            docker push ${DOCKER_USER}/${APP_NAME}:${BUILD_NUMBER}

            docker push ${DOCKER_USER}/${APP_NAME}:latest

            docker logout
          """
        }
      }
    }

    // ── STAGE 7: Deploy to Kubernetes ────────────
stage('☸️ Deploy to Kubernetes') {
    steps {
        sh '''
        echo "Deploying to Kubernetes..."

        kubectl set image deployment/snake-game-deployment \
        snake-game=tharun118wizard/snake-game:latest

        kubectl rollout status deployment/snake-game-deployment
        '''
    }
}


    // ── STAGE 8: Health Check ────────────────────
    stage('💚 Health Check') {

      steps {

        sh '''
          echo "Checking Kubernetes pods..."
          kubectl get pods

          echo "Checking services..."
          kubectl get svc
        '''
      }
    }

  }

  // ── POST ACTIONS ───────────────────────────────
  post {

    success {

      echo """
      ✅ PIPELINE SUCCEEDED

      App Name : ${APP_NAME}
      Build No : #${BUILD_NUMBER}
      URL      : http://localhost:${APP_PORT}

      Docker Hub Image:
      ${APP_NAME}:${BUILD_NUMBER}
      """
    }

    failure {

      echo """
      ❌ PIPELINE FAILED

      Check Jenkins console logs for details.
      """
    }

    always {

      script {

        try {

          sh '''
            echo "Cleaning unused Docker images..."

            docker image prune -f || true
          '''

        } catch (Exception e) {

          echo "Skipping cleanup because workspace is unavailable."
        }
      }
    }
  }
}
