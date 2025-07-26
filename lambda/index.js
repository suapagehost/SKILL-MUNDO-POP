/* eslint-disable no-console */
const Alexa = require('ask-sdk-core');

const DOCUMENT_ID = "bomsucessofm"; // ID do APL

const STREAMS = [
  {
    token: 'Cultura-FM-104,9-Bom Sucesso',
    url: 'https://stm4.conectastreaming.com:14796/stream',
    metadata: {
      title: 'Cultura FM 104,9 - Bom Sucesso',
      subtitle: 'Música de qualidade',
      art: {
        sources: [
          {
            contentDescription: 'Logo da Rádio Cultura FM',
            url: 'https://driver.ovh/api/v1/file-entries/989?workspaceId=0&thumbnail=',
            widthPixels: 512,
            heightPixels: 512,
          },
        ],
      },
      backgroundImage: {
        sources: [
          {
            contentDescription: 'Imagem de fundo da rádio',
            url: '',
            widthPixels: 1200,
            heightPixels: 800,
          },
        ],
      },
    },
  },
];

// Renderiza APL
const createAPLDirective = (documentId, token = "documentToken") => ({
  type: "Alexa.Presentation.APL.RenderDocument",
  token,
  document: {
    type: "Link",
    src: "doc://alexa/apl/documents/" + documentId
  }
});

// Inicia o áudio
const PlayStreamIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest' ||
      (request.type === 'IntentRequest' && [
        'PlayStreamIntent',
        'AMAZON.ResumeIntent',
        'AMAZON.StartOverIntent',
      ].includes(request.intent.name));
  },
  handle(handlerInput) {
    const stream = STREAMS[0];

    if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
      handlerInput.responseBuilder.addDirective(createAPLDirective(DOCUMENT_ID));
    }

    return handlerInput.responseBuilder
      .speak(`Sintonizando agora ${stream.metadata.title}. Tá na Cultura, tá bom demais!`)
      .addAudioPlayerPlayDirective('REPLACE_ALL', stream.url, stream.token, 0, null, stream.metadata)
      .getResponse();
  },
};

// Para o áudio
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && [
      'AMAZON.StopIntent',
      'AMAZON.PauseIntent',
      'AMAZON.CancelIntent'
    ].includes(request.intent.name);
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective()
      .speak('Encerrando a transmissão. Até logo!')
      .getResponse();
  },
};

// Ajuda
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakText = 'Você pode dizer "tocar a rádio" para começar ou "parar" para encerrar. Como posso ajudar?';

    return handlerInput.responseBuilder
      .speak(speakText)
      .reprompt(speakText)
      .getResponse();
  },
};

// Informações sobre a rádio
const AboutIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getIntentName(handlerInput.requestEnvelope) === 'AboutIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Essa skill transmite a Rádio Cultura FM 104,9 de Bom Sucesso, com o melhor da música e informação.')
      .getResponse();
  },
};

// Fallback para frases desconhecidas
const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Desculpe, não entendi o que você disse. Tente novamente dizendo "tocar a rádio" ou "parar".')
      .reprompt('Você pode dizer "tocar a rádio" ou "parar".')
      .getResponse();
  },
};

// Sessão encerrada
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Sessão encerrada: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

// Eventos de reprodução
const PlaybackStartedHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'AudioPlayer.PlaybackStarted';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  },
};

const PlaybackStoppedHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'AudioPlayer.PlaybackStopped';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  },
};

// Tratamento de erros
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error(`Erro: ${error.message}`);
    return handlerInput.responseBuilder
      .speak('Desculpe, aconteceu um erro ao processar sua solicitação.')
      .getResponse();
  },
};

// Exporta skill
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    PlayStreamIntentHandler,
    CancelAndStopIntentHandler,
    HelpIntentHandler,
    AboutIntentHandler,
    FallbackIntentHandler,
    PlaybackStartedHandler,
    PlaybackStoppedHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
