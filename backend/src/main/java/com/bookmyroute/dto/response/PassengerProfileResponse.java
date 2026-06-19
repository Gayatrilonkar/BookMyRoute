package com.bookmyroute.dto.response;

import com.bookmyroute.entity.Gender;
import com.bookmyroute.entity.PassengerProfile;

public class PassengerProfileResponse {
    private Long id;
    private String fullName;
    private Integer age;
    private Gender gender;
    private boolean isDefault;

    public static PassengerProfileResponse fromEntity(PassengerProfile entity) {
        if (entity == null) return null;
        PassengerProfileResponse dto = new PassengerProfileResponse();
        dto.setId(entity.getId());
        dto.setFullName(entity.getFullName());
        dto.setAge(entity.getAge());
        dto.setGender(entity.getGender());
        dto.setDefault(entity.isDefault());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }
    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean aDefault) { isDefault = aDefault; }
}
