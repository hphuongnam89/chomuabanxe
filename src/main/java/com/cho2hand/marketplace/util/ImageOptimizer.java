package com.cho2hand.marketplace.util;

import com.cho2hand.marketplace.exception.InvalidMediaException;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.*;
import javax.imageio.ImageIO;
import org.springframework.web.multipart.MultipartFile;

public final class ImageOptimizer {
    private static final int MAX_SIDE = 1600;
    private ImageOptimizer() {}

    public static byte[] toWebp(MultipartFile file) {
        try {
            BufferedImage source = ImageIO.read(file.getInputStream());
            if (source == null) throw new InvalidMediaException("Ảnh không hợp lệ hoặc bị lỗi.");
            BufferedImage resized = resize(source);
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            if (!ImageIO.write(resized, "webp", output)) throw new InvalidMediaException("Không thể chuyển ảnh sang WebP.");
            return output.toByteArray();
        } catch (InvalidMediaException exception) {
            throw exception;
        } catch (IOException exception) {
            throw new InvalidMediaException("Không thể đọc ảnh tải lên.");
        }
    }

    private static BufferedImage resize(BufferedImage source) {
        int width = source.getWidth(), height = source.getHeight();
        double ratio = Math.min(1.0, (double) MAX_SIDE / Math.max(width, height));
        int targetWidth = Math.max(1, (int) Math.round(width * ratio));
        int targetHeight = Math.max(1, (int) Math.round(height * ratio));
        BufferedImage target = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = target.createGraphics();
        graphics.setColor(Color.WHITE);
        graphics.fillRect(0, 0, targetWidth, targetHeight);
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        graphics.drawImage(source, 0, 0, targetWidth, targetHeight, null);
        graphics.dispose();
        return target;
    }
}
