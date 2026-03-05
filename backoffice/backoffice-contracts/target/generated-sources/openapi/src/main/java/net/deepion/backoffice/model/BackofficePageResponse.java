package net.deepion.backoffice.model;

import java.net.URI;
import java.util.Objects;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonCreator;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import net.deepion.backoffice.model.BackofficeResponse;
import java.time.OffsetDateTime;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import io.swagger.v3.oas.annotations.media.Schema;


import java.util.*;
import jakarta.annotation.Generated;

/**
 * BackofficePageResponse
 */

@Generated(value = "org.openapitools.codegen.languages.SpringCodegen", date = "2026-03-05T08:50:56.712342320-03:00[America/Sao_Paulo]", comments = "Generator version: 7.10.0")
public class BackofficePageResponse {

  @Valid
  private List<@Valid BackofficeResponse> content = new ArrayList<>();

  private Integer page;

  private Integer size;

  private Long totalElements;

  private Integer totalPages;

  public BackofficePageResponse() {
    super();
  }

  /**
   * Constructor with only required parameters
   */
  public BackofficePageResponse(List<@Valid BackofficeResponse> content, Integer page, Integer size, Long totalElements, Integer totalPages) {
    this.content = content;
    this.page = page;
    this.size = size;
    this.totalElements = totalElements;
    this.totalPages = totalPages;
  }

  public BackofficePageResponse content(List<@Valid BackofficeResponse> content) {
    this.content = content;
    return this;
  }

  public BackofficePageResponse addContentItem(BackofficeResponse contentItem) {
    if (this.content == null) {
      this.content = new ArrayList<>();
    }
    this.content.add(contentItem);
    return this;
  }

  /**
   * Get content
   * @return content
   */
  @NotNull @Valid 
  @Schema(name = "content", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("content")
  public List<@Valid BackofficeResponse> getContent() {
    return content;
  }

  public void setContent(List<@Valid BackofficeResponse> content) {
    this.content = content;
  }

  public BackofficePageResponse page(Integer page) {
    this.page = page;
    return this;
  }

  /**
   * Get page
   * @return page
   */
  @NotNull 
  @Schema(name = "page", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("page")
  public Integer getPage() {
    return page;
  }

  public void setPage(Integer page) {
    this.page = page;
  }

  public BackofficePageResponse size(Integer size) {
    this.size = size;
    return this;
  }

  /**
   * Get size
   * @return size
   */
  @NotNull 
  @Schema(name = "size", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("size")
  public Integer getSize() {
    return size;
  }

  public void setSize(Integer size) {
    this.size = size;
  }

  public BackofficePageResponse totalElements(Long totalElements) {
    this.totalElements = totalElements;
    return this;
  }

  /**
   * Get totalElements
   * @return totalElements
   */
  @NotNull 
  @Schema(name = "totalElements", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("totalElements")
  public Long getTotalElements() {
    return totalElements;
  }

  public void setTotalElements(Long totalElements) {
    this.totalElements = totalElements;
  }

  public BackofficePageResponse totalPages(Integer totalPages) {
    this.totalPages = totalPages;
    return this;
  }

  /**
   * Get totalPages
   * @return totalPages
   */
  @NotNull 
  @Schema(name = "totalPages", requiredMode = Schema.RequiredMode.REQUIRED)
  @JsonProperty("totalPages")
  public Integer getTotalPages() {
    return totalPages;
  }

  public void setTotalPages(Integer totalPages) {
    this.totalPages = totalPages;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    BackofficePageResponse backofficePageResponse = (BackofficePageResponse) o;
    return Objects.equals(this.content, backofficePageResponse.content) &&
        Objects.equals(this.page, backofficePageResponse.page) &&
        Objects.equals(this.size, backofficePageResponse.size) &&
        Objects.equals(this.totalElements, backofficePageResponse.totalElements) &&
        Objects.equals(this.totalPages, backofficePageResponse.totalPages);
  }

  @Override
  public int hashCode() {
    return Objects.hash(content, page, size, totalElements, totalPages);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class BackofficePageResponse {\n");
    sb.append("    content: ").append(toIndentedString(content)).append("\n");
    sb.append("    page: ").append(toIndentedString(page)).append("\n");
    sb.append("    size: ").append(toIndentedString(size)).append("\n");
    sb.append("    totalElements: ").append(toIndentedString(totalElements)).append("\n");
    sb.append("    totalPages: ").append(toIndentedString(totalPages)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}

