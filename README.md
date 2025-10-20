# ⚓ Морской бой - Игра с улучшенным ИИ

Это игра "Морской бой" с продвинутым искусственным интеллектом, созданная с помощью [Expo](https://expo.dev).

## 🎯 Особенности ИИ

Игра включает в себя улучшенную систему ИИ с тремя уровнями сложности:

### 🧭 ШТУРМАН (Легкий уровень)
- Случайные выстрелы
- Медленная реакция (2 секунды задержки)
- 30% точность
- Простая стратегия

### ⚓ КАПИТАН (Средний уровень)
- Умная охота с шахматным паттерном
- Средняя скорость реакции (1.5 секунды)
- 60% точность
- Анализ паттернов

### 🏆 АДМИРАЛ (Сложный уровень)
- Адаптивная стратегия
- Анализ плотности промахов
- Быстрая реакция (0.8 секунды)
- 85% точность
- Память о предыдущих играх
- Умный выбор направления преследования

## 🚀 Технические улучшения

- **Адаптивное поведение**: ИИ меняет стратегию в зависимости от успешности
- **Паттерн-анализ**: Анализ истории выстрелов для улучшения точности
- **Умная охота**: Приоритизация клеток с высокой вероятностью попадания
- **Память ИИ**: Сохранение информации о потопленных кораблях
- **Настраиваемая сложность**: Загрузка настроек из AsyncStorage

## 🏗️ Архитектура ИИ

```
┌─────────────────────────────────────────────────────────────┐
│                    ИИ МОРСКОГО БОЯ                          │
├─────────────────────────────────────────────────────────────┤
│  Уровень сложности (easy/medium/hard)                      │
│  ├─ Конфигурация (точность, задержка, возможности)         │
│  └─ Стратегия (агрессивная/оборонительная/сбалансированная)│
├─────────────────────────────────────────────────────────────┤
│  Режимы работы:                                             │
│  ├─ Охота (hunting)                                        │
│  │  ├─ Случайные выстрелы (easy)                           │
│  │  ├─ Шахматный паттерн (medium)                          │
│  │  └─ Анализ плотности промахов (hard)                    │
│  └─ Преследование (targeting)                              │
│     ├─ Определение направления корабля                     │
│     ├─ Умный выбор направления (hard)                      │
│     └─ Адаптивная стратегия                                │
├─────────────────────────────────────────────────────────────┤
│  Память и анализ:                                           │
│  ├─ История выстрелов (patternMemory)                      │
│  ├─ Статистика попаданий/промахов                          │
│  ├─ Анализ потопленных кораблей                            │
│  └─ Адаптация стратегии                                    │
└─────────────────────────────────────────────────────────────┘
```

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
