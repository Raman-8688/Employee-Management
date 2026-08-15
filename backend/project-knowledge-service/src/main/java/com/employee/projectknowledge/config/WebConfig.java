package com.employee.projectknowledge.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadPath = new File("project-docs/").getAbsolutePath();
        registry.addResourceHandler("/project-docs/**")
                .addResourceLocations("file:" + uploadPath + "/");
    }
}
