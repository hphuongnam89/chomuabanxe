package com.cho2hand.marketplace.util;

import static org.junit.jupiter.api.Assertions.*;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

class ImageOptimizerTest {
    @Test
    void convertsJpegToWebp() throws Exception {
        BufferedImage image = new BufferedImage(20, 20, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = image.createGraphics();
        graphics.setColor(Color.ORANGE);
        graphics.fillRect(0, 0, 20, 20);
        graphics.dispose();
        ByteArrayOutputStream jpeg = new ByteArrayOutputStream();
        ImageIO.write(image, "jpeg", jpeg);

        byte[] webp = ImageOptimizer.toWebp(new MockMultipartFile("file", "a.jpg", "image/jpeg", jpeg.toByteArray()));

        assertTrue(webp.length > 0);
        assertEquals('R', webp[0]);
        assertEquals('I', webp[1]);
        assertEquals('F', webp[2]);
        assertEquals('F', webp[3]);
    }
}
