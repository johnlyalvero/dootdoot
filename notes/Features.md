>Un’applicazione per aiutare gli studenti ad organizzare i propri impegni scolastici, compiti e sessioni di studio, con un sistema feedback e statistiche per poter tener traccia del proprio andamento.

# Features
## 1. Autenticazione

### 1.1 Registrazione Studente (Sign up)

Lo studente potrà creare un account fornendo:

- Username
    
- Password
    
- Immagine profilo (facoltativa)
    
- Scuola
    
- Classe

### 1.2 Accesso all'applicazione (Login)

Login tramite username e password per accedere all’app e ai propri dati personali e di studio.

---
## 2. Gestione Compiti e Verifiche

### 2.1 Creazione di Task e Test

L’utente potrà scrivere in un apposita pagina, in un textarea:

- Task scolastici (es. compiti, esercizi)
    
- Test/verifiche con data programmata

💡 Automazione: all’inserimento di un test, verranno generate automaticamente 4 sessioni di studio, così suddivise:

- 7 giorni prima
    
- 6 giorni prima
    
- 3 giorni prima
    
- 1 giorno prima (ripasso)
    

Tutti i dati saranno salvati nel database.

---
### 2.2 Visualizzazione organizzata

Esiste una pagina dedicata alla visualizzazione separata di:

- Task, ordinati per scadenza
    
- Test, ordinati per data della verifica, con le study sessions associate visualizzate sotto ogni test  

L’utente potrà:

- Modificare ogni task, test e sessione di studio
    
- Visualizzare e gestire le attività in modo intuitivo  

---
## 3. To-Do List Giornaliera

Una sezione mostrerà:

- Task ancora da completare
    
- Study sessions previste per la giornata

Offre una panoramica chiara delle attività quotidiane da svolgere.

---
## 4. Focus Timer con Collegamento Sessione

È disponibile un timer regolabile da 25 minuti fino a 2 ore per supportare lo studio focalizzato.

### Funzionamento:

- Prima di avviare il timer, l’utente seleziona una o più task o una sessione di studio da svolgere
    
- Al termine del timer, se la sessione di studio è contrassegnata come completata, compare automaticamente un pop-up con un sondaggio di feedback

---
## 5. Feedback Post-Sessione

Al completamento di una study session, viene richiesto un breve feedback attraverso il seguente sondaggio:

- Focus → Quanto sei riuscito a concentrarti? (scala 1–5 o emoji)
    
- Distrazioni → Cosa ti ha distratto? (checklist rapida)
    
- Utilità → Ti è servita questa sessione? (slider o emoji)
    
- Certainty → Quanto ti senti sicuro dell’argomento? (Sicurissimo, Abbastanza sicuro, Incerto, Molto insicuro)
    
- Metodo e strumenti → Che metodo/stile hai usato? (dropdown con opzioni predefinite + aggiunta manuale, selezione multipla)
    

- Opzioni di default: Lettura, Schemi, Riassunti, Mappa mentale, Video, Quiz, Musica
    

- Note personali (facoltativo) → Vuoi scrivere qualcosa su questa sessione? (textarea)

📌 Tutti questi dati sono attributi della singola study session.

---
## 6. Profilo Utente

### 6.1 Dati utente

Nella parte superiore della pagina profilo saranno visibili:

- Nome utente
    
- Data odierna
    
- Immagine profilo
    
- Scuola
    
- Classe  

### 6.2 Statistiche personali

Vengono mostrate le seguenti metriche, calcolate automaticamente a partire dai feedback e dalle interazioni dell’utente:

#### Focus: Media dei livelli di concentrazione nelle sessioni svolte.  
Unità: valore medio su 5 stelle

#### Disciplina: Rispetto delle scadenze. Penalità per ritardi e procrastinazione, premi per recuperi.  
Unità: percentuale di adempimento (%)

#### Efficienza: Rapporto tra tempo di studio e qualità percepita  
Unità: indice su 100

#### Dedizione: Frequenza e costanza nelle interazioni significative (es. inserimento impegni, completamento attività, accessi).  
Unità: percentuale o badge settimanale

📎 Per dettagli sul calcolo di ogni metrica, si rimanda alla sezione "Calcolo delle statistiche".

---
## 7. Calcolo delle Statistiche

### 🔸 Focus

Formula:  
Focus = media(valori_concentrazione_su_5)

Visualizzazione: ⭐️⭐️⭐️⭐️☆ oppure 4.2/5

---
### 🔸 Disciplina

Regole:

- +1 punto → completamento puntuale  
      
    
- 0 punti → non completato  
      
    
- -0.5 → completato in ritardo  
      
    
- +0.5 → completato in recupero  
      
    

Formula:  
Disciplina = (Punti ottenuti / Punti massimi possibili) * 100

Visualizzazione: percentuale (%)

---

### 🔸 Efficienza

Input: tempo registrato dal timer + feedback qualità  
Formula semplificata:  
Efficienza = (media(valori_produttività) / ore_totali) * Fattore_scalante

Visualizzazione: indice su 100

---

### 🔸 Dedizione

Azioni considerate:

- Inserimento task, test, sessioni  
      
- Completamento di sessioni/task  
    
- Accessi giornalieri diversi  

Formula:  
Dedizione = (azioni_significative / soglia_ideale_settimanale) * 100

Visualizzazione: percentuale o badge (🟢 Attivo / 🟡 Moderato / 🔴 Basso)