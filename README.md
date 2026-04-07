# TechMatchingSite2
Wegens een kleine security breach heeft het team besloten een nieuwe publieke repository te maken voor onze Matching Website voor CMD jaar 2 Tech. Waar wij illegale racecoureurs met elkaar matchen om tegen elkaar te racen op straat. Waarbij bijgehouden wordt welke gebruiker wint voor klassementen tussen de racers. 

**TechMatchingSite2** is een webapplicatie gebouwd als teamproject voor CMD Jaar 2 Tech.  
Het project is gestart na een eerdere beveiligingsinbreuk, waardoor het team een nieuwe publieke repository is begonnen.

De site stelt gebruikers in staat om te matchen met andere gebruikers die *illegale straatracers* zijn, en houdt de overwinningen en ranglijsten bij van verschillende race-uitdagingen.

---

## Functionaliteiten

- Gebruikersmatchmaking voor straatracers  
- Bijhouden van race-uitkomsten en ranglijsten  
- Eenvoudige, interactieve interface met matchmaking en resultatenweergave
- Ingebouwde chat functie

---

## Technologieën

Het project maakt gebruik van:

- **EJS** voor server-side templating  
- **Node.js** met **Express** voor de backend  
- **CSS** voor stijlen  
- Statische bestanden in `/static`  
- Routing-logica in `/routes`  
- Middleware in `/middleware`

Talenverdeling volgens GitHub-statistieken:
- EJS (~64%)
- JavaScript (~22%)
- CSS (~14%) ([github.com](https://github.com/RodinKett/TechMatchingSite2/tree/Dev))

---

## Vereisten
Zorg dat je het volgende geïnstalleerd hebt:
* Node.js (v14+)  
* npm of yarn

---

## Installatie

1. Clone de repository:

   ```bash
   git clone https://github.com/RodinKett/TechMatchingSite2.git
   cd TechMatchingSite2

2. Installeer de dependencies:
npm install

3. Start de ontwikkelserver:

npm start
Open je browser en ga naar:
http://localhost:3000

### Gebruik van de app
Wanneer de server draait:
* Bezoek de homepage
* Maak een profiel of match met andere racers
* Houd overwinningen bij en bekijk ranglijsten
* Chat met matches

Zorg dat eventuele benodigde environment-variabelen of configuraties voor databases ingesteld zijn.
* URI={jouw database URI}
* SESSION_SECRET={jouw session secret}
*API_NINJAS_KEY={jouw API sleutel}
