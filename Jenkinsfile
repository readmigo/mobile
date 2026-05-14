pipeline {
    agent { label 'mobile' }

    environment {
        NODE_VERSION     = '20'
        PNPM_VERSION     = '9'
        BUNDLE_ID_IOS    = 'com.readmigo.app'
        PACKAGE_NAME     = 'com.readmigo.app'
        KEYCHAIN_NAME    = 'build.keychain'
        MATCH_GIT_URL    = credentials('match-git-url')
        FASTLANE_USER    = credentials('apple-id')
        APP_STORE_KEY_ID = credentials('app-store-connect-key-id')
    }

    options {
        timeout(time: 45, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    stages {
        stage('Setup') {
            steps {
                sh 'corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate'
                sh 'pnpm install --frozen-lockfile'
            }
        }

        stage('Lint & Typecheck') {
            parallel {
                stage('ESLint') {
                    steps { sh 'pnpm lint' }
                }
                stage('TypeScript') {
                    steps { sh 'pnpm typecheck' }
                }
            }
        }

        stage('Test') {
            steps {
                sh 'pnpm test --ci --coverage'
            }
            post {
                always {
                    junit 'coverage/junit.xml'
                    publishHTML(target: [
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }

        stage('Build iOS') {
            when { anyOf { branch 'main'; branch 'release/*' } }
            steps {
                dir('ios') {
                    sh 'bundle exec pod install'
                }
                sh 'bundle exec fastlane ios build_enterprise'
            }
            post {
                success {
                    archiveArtifacts artifacts: 'ios/build/*.ipa', fingerprint: true
                }
            }
        }

        stage('Build Android') {
            when { anyOf { branch 'main'; branch 'release/*' } }
            steps {
                dir('android') {
                    sh './gradlew assembleRelease -PversionCode=${BUILD_NUMBER}'
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'android/app/build/outputs/apk/release/*.apk', fingerprint: true
                }
            }
        }

        stage('Distribute') {
            when { branch 'release/*' }
            parallel {
                stage('iOS → MDM') {
                    steps {
                        sh 'bundle exec fastlane ios distribute_enterprise'
                    }
                }
                stage('Android → Internal') {
                    steps {
                        sh 'bundle exec fastlane android distribute_internal'
                    }
                }
            }
        }

        stage('OTA Update') {
            when {
                allOf {
                    branch 'main'
                    not { changeset 'ios/**' }
                    not { changeset 'android/**' }
                }
            }
            steps {
                sh 'npx shorebird release --platform=all'
            }
        }
    }

    post {
        failure {
            slackSend(
                channel: '#mobile-ci',
                color: 'danger',
                message: "❌ ${env.JOB_NAME} #${env.BUILD_NUMBER} failed: ${env.BUILD_URL}"
            )
        }
        success {
            slackSend(
                channel: '#mobile-ci',
                color: 'good',
                message: "✅ ${env.JOB_NAME} #${env.BUILD_NUMBER} passed"
            )
        }
    }
}
