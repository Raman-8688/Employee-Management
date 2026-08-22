package com.employee.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuAccessDto {

    private String id;
    private String title;
    private String icon;
    private String route;
    private List<String> roles;
    private List<SubMenuItemDto> subMenus;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubMenuItemDto {
        private String id;
        private String title;
        private String route;
        private List<String> roles;
    }
}
