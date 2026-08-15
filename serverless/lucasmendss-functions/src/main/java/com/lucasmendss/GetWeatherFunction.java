package com.lucasmendss;

import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Optional;

/**
 * Azure Functions with HTTP Trigger.
 */

// https://learn.microsoft.com/en-us/azure/azure-functions/functions-create-maven-intellij#create-the-function-app-in-azure
public class GetWeatherFunction {
    @FunctionName("weather")
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.GET},
                    authLevel = AuthorizationLevel.ANONYMOUS)
            HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {

        context.getLogger().info("Java HTTP trigger processed a request.");

        final String lat = request.getQueryParameters().get("lat");
        final String lon = request.getQueryParameters().get("lon");
        final String location = request.getQueryParameters().get("location");

        final boolean hasLat = lat != null && !lat.trim().isEmpty();
        final boolean hasLon = lon != null && !lon.trim().isEmpty();
        final boolean hasLocation = location != null && !location.trim().isEmpty();

        if (hasLocation && (hasLat || hasLon)) {
            return jsonResponse(request, HttpStatus.BAD_REQUEST,
                    "{\"error\":\"Informe ou 'location' ou ('lat' e 'lon'). Não envie ambos\"}");
        }

        if ((hasLat && !hasLon) || (!hasLat && hasLon)) {
            return jsonResponse(request, HttpStatus.BAD_REQUEST,
                    "{\"error\":\"Se passar coordenadas, informe ambas: 'lat' e 'lon'\"}");
        }

        if (!hasLocation && !(hasLat && hasLon)) {
            return jsonResponse(request, HttpStatus.BAD_REQUEST,
                    "{\"error\":\"Informe 'location' ou ambas as coordenadas 'lat' e 'lon'\"}");
        }

        String apiKey = System.getenv("OPENWEATHER_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            return jsonResponse(request, HttpStatus.INTERNAL_SERVER_ERROR,
                    "{\"error\":\"Variável de ambiente OPENWEATHER_API_KEY não configurada\"}");
        }

        StringBuilder url = new StringBuilder("https://api.openweathermap.org/data/2.5/weather?lang=pt_br&units=metric");

        if (hasLat && hasLon) {
            try {
                Double.parseDouble(lat.trim());
                Double.parseDouble(lon.trim());
            } catch (NumberFormatException e) {
                return jsonResponse(request, HttpStatus.BAD_REQUEST,
                        "{\"error\":\"'lat' e 'lon' devem ser números válidos\"}");
            }

            url.append("&lat=").append(lat.trim())
                    .append("&lon=").append(lon.trim())
                    .append("&appid=")
                    .append(URLEncoder.encode(apiKey, java.nio.charset.StandardCharsets.UTF_8));
        } else {
            url.append("&q=")
                    .append(URLEncoder.encode(location.trim(), java.nio.charset.StandardCharsets.UTF_8))
                    .append("&appid=")
                    .append(URLEncoder.encode(apiKey, java.nio.charset.StandardCharsets.UTF_8));
        }

        HttpClient client = HttpClient.newHttpClient();

        HttpRequest requestToOpenWeather = HttpRequest.newBuilder()
                .uri(URI.create(url.toString()))
                .GET()
                .build();

        try {
            HttpResponse<String> openWeatherResponse =
                    client.send(requestToOpenWeather, HttpResponse.BodyHandlers.ofString());

            return request.createResponseBuilder(HttpStatus.valueOf(openWeatherResponse.statusCode()))
                    .header("Content-Type", "application/json")
                    .body(openWeatherResponse.body())
                    .build();

        } catch (IOException | InterruptedException e) {
            return jsonResponse(request, HttpStatus.INTERNAL_SERVER_ERROR,
                    "{\"error\":\"Erro ao consultar a API de meteorologia.\"}");
        }
    }

    private HttpResponseMessage jsonResponse(HttpRequestMessage<Optional<String>> request,
                                             HttpStatus status,
                                             String jsonBody) {
        return request.createResponseBuilder(status)
                .header("Content-Type", "application/json")
                .body(jsonBody)
                .build();
    }
}