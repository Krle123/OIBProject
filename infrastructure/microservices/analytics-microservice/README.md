# Analytics Microservice - O'Sinjel De Or Parfumerie

Микросервис за анализу података, креирање фискалних рачуна и генерисање извештаја.

## Функционалности

### Фискални Рачуни
- Креирање фискалних рачуна на основу продаје
- Чување рачуна у бази података `izvestaji_analize`
- Генерисање јединственог броја рачуна (формат: `FR-YYYYMMDD-NNNN`)
- Преглед свих рачуна и појединачних рачуна
- Експорт рачуна у PDF формат

### Анализе Продаје
- **Продаја по месецу** - Укупна продаја и број трансакција за изабрани месец
- **Продаја по недељи** - Статистика продаје за изабрану недељу
- **Продаја по години** - Годишња анализа са месечним разбијањем
- **Укупна продаја** - Свеукупна статистика продаје
- **Тренд продаје** - Дневна анализа тренда за изабрани период
- **Топ 10 најпродаванијих парфема** - Рангирање по количини
- **Топ 10 парфема по приходу** - Рангирање по укупном приходу

### PDF Експорт
- Фискални рачуни се могу извести као PDF документи
- Извештаји анализа се могу извести као PDF документи
- Подршка за српску ћирилицу

## Техничке Детаље

### Порт
- **3005**

### База Података
- **izvestaji_analize** - MySQL база података

### API Endpoints

#### Фискални Рачуни
- `POST /api/v1/analysis/sales` - Креирање фискалног рачуна (Public - за sales microservice)
- `GET /api/v1/receipts` - Преглед свих рачуна
- `GET /api/v1/receipts/:id` - Преглед појединачног рачуна
- `GET /api/v1/receipts/number/:number` - Преглед рачуна по броју
- `GET /api/v1/receipts/:id/pdf` - Преузимање PDF рачуна

#### Анализе
- `GET /api/v1/analytics/sales/by-month?month=X&year=Y` - Продаја по месецу
- `GET /api/v1/analytics/sales/by-week?week=X&year=Y` - Продаја по недељи
- `GET /api/v1/analytics/sales/by-year?year=Y` - Продаја по години
- `GET /api/v1/analytics/sales/total` - Укупна продаја
- `GET /api/v1/analytics/sales/trend?startDate=X&endDate=Y` - Тренд продаје
- `GET /api/v1/analytics/top-10/best-selling` - Топ 10 најпродаванијих
- `GET /api/v1/analytics/top-10/revenue` - Топ 10 по приходу

#### Извештаји
- `GET /api/v1/analytics/reports` - Све креиране извештаје
- `GET /api/v1/analytics/reports/:id` - Појединачни извештај
- `GET /api/v1/analytics/reports/type/:type` - Извештаји по типу
- `GET /api/v1/analytics/reports/:id/pdf` - Преузимање PDF извештаја

## Интеграција

### Sales Microservice
Sales микросервис шаље податке о продаји на:
```
POST http://localhost:3005/api/v1/analysis/sales
```

Ова рута је **јавна** (не захтева аутентификацију) и аутоматски креира фискални рачун.

### Gateway API
Сви остали endpoint-и су доступни преко Gateway API-ја на:
```
http://localhost:4000/api/v1/analytics/*
```

## Покретање

```bash
cd infrastructure/microservices/analytics-microservice
npm install
npm start
```

Или из главног директоријума:
```bash
npm run install:microservice:analytics
npm run start:microservice:analytics
```

## Зависности
- Express.js
- TypeORM
- MySQL2
- PDFKit (за генерисање PDF-ова)
- JWT (за аутентификацију)
