package com.poly.restaurant.sse;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Component
public class OrderSseBroadcaster {
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter register() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        try {
            emitter.send(SseEmitter.event().name("INIT").data("CONNECTED"));
        } catch (IOException ignored) {}
        return emitter;
    }

    public void emit(String event) {
        emitters.forEach(em -> {
            try { em.send(SseEmitter.event().name("ORDER_EVENT").data(event)); }
            catch (Exception e) { em.complete(); }
        });
    }

    public void emitAfterCommit(String event) {
        try {
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override public void afterCommit() { emit(event); }
                }
            );
        } catch (Exception e) {
            emit(event);
        }
    }
}


