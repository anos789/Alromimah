FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-17-jdk-headless \
    curl \
    unzip \
    wget \
    git \
    python3 \
    python3-distutils \
    zip \
    && rm -rf /var/lib/apt/lists/*

# Install Android SDK command line tools
RUN mkdir -p /opt/android-sdk/cmdline-tools && \
    curl -fsSL https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -o /tmp/cmdline-tools.zip && \
    unzip /tmp/cmdline-tools.zip -d /opt/android-sdk/cmdline-tools && \
    rm /tmp/cmdline-tools.zip

ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH="$PATH:/opt/android-sdk/cmdline-tools/latest/bin:/opt/android-sdk/platform-tools"

RUN yes | sdkmanager --sdk_root=${ANDROID_SDK_ROOT} --licenses >/dev/null && \
    sdkmanager --sdk_root=${ANDROID_SDK_ROOT} "platform-tools" "platforms;android-35" "build-tools;35.0.0" "build-tools;34.0.0" "platforms;android-34"

WORKDIR /workspace

COPY gradlew /workspace/gradlew
COPY gradle /workspace/gradle
COPY build.gradle.kts settings.gradle.kts /workspace/
COPY app /workspace/app
COPY .env.example /workspace/.env.example

RUN chmod +x /workspace/gradlew

CMD ["bash"]
