package com.kobipast.userservice.architecture.integration.error;

public class DownstreamProblemException extends RuntimeException {
    private final int status;
    private final String body;
    private final String contentType;

    public DownstreamProblemException(int status, String body, String contentType) {
        super("Downstream returned HTTP " + status);
        this.status = status;
        this.body = body;
        this.contentType = contentType;
    }

    public int getStatus() { return status; }
    public String getBody() { return body; }
    public String getContentType() { return contentType; }
}
