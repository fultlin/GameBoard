# Инфа для разрабов 👋

Это репозиторий для проекта мобильной игры "Морской бой"

## Установка

1. Установка зависимостей

   ```bash
   npm install
   ```

2. Установка expo cli (необходимо установить глобально)
   ```bash
   npm install -g @expo/cli
   ```

3. Start the app

   ```bash
   npm run start 
   ```

В таком случае там будет возможность выбрать платформу, для которой скомпилируется. Так как у нас только под мобилку и iOS, то ввыбирать ничего не нужно
Для лоакльной разработки необходимо будет открыть ссылку в браузере

Возможные варианты открытия приложения:

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Для тестирования на iOS

Скачииваем приложение [Expo Go](https://expo.dev/go), с помощью камеры телефона сканим qr, и сможем увидеть наше приложение локально